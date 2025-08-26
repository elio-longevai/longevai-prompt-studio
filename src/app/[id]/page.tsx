'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import tilesData from '@/data/tiles.json';
import { templateLoader } from '@/lib/templateLoader';
import { ProposalTypeSelector } from '@/components/studio/ProposalTypeSelector';
import { GeneratorForm, TileInput } from '@/components/studio/GeneratorForm';
import { ToastNotification } from '@/components/studio/ToastNotification';
import { Document } from '@/components/studio/DocumentUploader';

interface TileData {
  id: string;
  title: string;
  description: string;
  icon: string;
  system_prompt?: string;
  system_prompts?: {
    html?: string;
    markdown?: string;
  };
  inputs: TileInput[];
  output: {
    copy_button_text: string;
    link_button_text: string;
    url: string;
  };
}

export default function GeneratorPage() {
  const params = useParams();
  const [tileData, setTileData] = useState<TileData | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [includeLAIContext, setIncludeLAIContext] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [longevaiContextContent, setLongevaiContextContent] = useState<string>('');
  const [selectedProposalType, setSelectedProposalType] = useState<'html' | 'markdown' | null>(null);
  const [templateContent, setTemplateContent] = useState<string>('');
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  useEffect(() => {
    const tile = tilesData.find((t) => t.id === params.id);
    if (tile) {
      setTileData(tile as TileData);
      const initialData: Record<string, string> = {};
      tile.inputs.forEach((input) => {
        if ('default' in input && input.default) {
          initialData[input.id] = input.default as string;
        } else if (input.type === 'select' && 'options' in input && Array.isArray(input.options) && input.options.length > 0) {
          initialData[input.id] = input.options[0];
        } else {
          initialData[input.id] = '';
        }
      });
      setFormData(initialData);
    }
    
    // Load longevai context content
    fetch('/longevai_context.txt')
      .then(res => res.text())
      .then(text => setLongevaiContextContent(text))
      .catch(err => console.log('Could not load LAI context:', err));
  }, [params.id]);

  useEffect(() => {
    if (params.id === 'proposal-generator' && selectedProposalType) {
      const templateId = selectedProposalType === 'html' ? 'html_template' : 'md_template';
      const defaultTemplateName = formData[templateId];
      if (defaultTemplateName) {
        loadTemplateContent(defaultTemplateName);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProposalType, params.id]);

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Handle template loading when template selection changes
    if (id === 'html_template' || id === 'md_template') {
      loadTemplateContent(value);
    }
  };

  const loadTemplateContent = async (templateName: string) => {
    if (!templateName || templateName === 'custom') {
      setTemplateContent('');
      setTemplateError(null);
      return;
    }
    setIsTemplateLoading(true);
    setTemplateError(null);
    try {
      const content = await templateLoader.loadTemplate(templateName);
      if (content.startsWith('Error:')) {
        setTemplateError(content);
        setTemplateContent('');
      } else {
        setTemplateContent(content);
      }
    } catch (error) {
      const message = 'Failed to load template.';
      console.error(message, error);
      setTemplateError(message);
      setTemplateContent('');
    } finally {
      setIsTemplateLoading(false);
    }
  };

  const handleAddDocument = () => {
    setDocuments((prev) => [...prev, { name: '', content: '' }]);
  };

  const handleDocumentChange = (index: number, field: 'name' | 'content', value: string) => {
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };


  const isFormValid = () => {
    if (!tileData) return false;
    if (params.id === 'proposal-generator' && !selectedProposalType) return false;
    
    const relevantInputs = tileData.inputs.filter((input) => {
      if (params.id !== 'proposal-generator') return true;
      return input.path === 'both' || input.path === selectedProposalType;
    });
    
    return relevantInputs.every((input) => {
      if (!input.required) return true;
      if (input.type === 'document_upload') return true;
      return formData[input.id] && formData[input.id].trim() !== '';
    });
  };

  const generatePrompt = () => {
    if (!tileData) return;

    let systemPrompt = '';
    let userPrompt = '';

    if (params.id === 'proposal-generator') {
      // Handle dual-path proposal generation
      if (selectedProposalType === 'html') {
        systemPrompt = tileData.system_prompts?.html || '';
        
        userPrompt = '<longevai_context>\n' + (longevaiContextContent || '') + '\n</longevai_context>\n\n';
        
        const htmlTemplate = formData.custom_html_template || templateContent;
        userPrompt += '<base_html_template>\n<![CDATA[\n' + htmlTemplate + '\n]]>\n</base_html_template>\n\n';
        
      } else if (selectedProposalType === 'markdown') {
        systemPrompt = tileData.system_prompts?.markdown || '';
        
        userPrompt = '<longevai_context>\n' + (longevaiContextContent || '') + '\n</longevai_context>\n\n';
        
        const mdTemplate = formData.custom_md_template || templateContent;
        userPrompt += '<markdown_template>\n' + mdTemplate + '\n</markdown_template>\n\n';
      }

      // Add context documents
      if (documents.length > 0) {
        userPrompt += '<context_docs>\n';
        documents.forEach((doc) => {
          if (doc.name && doc.content) {
            const tagName = doc.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            userPrompt += `<${tagName}>\n${doc.content}\n</${tagName}>\n\n`;
          }
        });
        userPrompt += '</context_docs>\n\n';
      }

      // Add business context fields
      if (formData.business_name) {
        userPrompt += `<business_name>\n${formData.business_name}\n</business_name>\n\n`;
      }
      if (formData.business_context) {
        userPrompt += `<business_context>\n${formData.business_context}\n</business_context>\n\n`;
      }
      if (formData.instructions) {
        userPrompt += `<instructions>\n${formData.instructions}\n</instructions>\n\n`;
      }

    } else {
      // Handle other generators (existing logic)
      systemPrompt = tileData.system_prompt || '';
      Object.keys(formData).forEach((key) => {
        const placeholder = `{{${key.toUpperCase()}}}`;
        systemPrompt = systemPrompt.replace(placeholder, formData[key]);
      });

      if (includeLAIContext) {
        userPrompt += `<longevai_context>\n${longevaiContextContent || ''}\n</longevai_context>\n\n`;
      }

      // Separate the main task/instruction input
      const mainInstructionInputId = 'task'; // Or 'instructions', adjust if needed
      let mainInstructionContent = '';

      tileData.inputs.forEach((input) => {
        if (input.id === mainInstructionInputId) {
          mainInstructionContent = formData[input.id] || '';
        } else if (input.type !== 'document_upload' && formData[input.id]) {
          // Add all other inputs first
          userPrompt += `<${input.id}>\n${formData[input.id]}\n</${input.id}>\n\n`;
        }
      });

      if (documents.length > 0) {
        userPrompt += '<context_docs>\n';
        documents.forEach((doc) => {
          if (doc.name && doc.content) {
            const tagName = doc.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            userPrompt += `<${tagName}>\n${doc.content}\n</${tagName}>\n`;
          }
        });
        userPrompt += '</context_docs>\n\n';
      }

      // Append the main task/instruction at the very end
      if (mainInstructionContent) {
        userPrompt += `<${mainInstructionInputId}>\n${mainInstructionContent}\n</${mainInstructionInputId}>\n`;
      }
    }
    
    navigator.clipboard.writeText(userPrompt.trim());
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  if (!tileData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-400">Generator not found</p>
          <Link href="/">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Proposal Generator: Show type selector first
  if (params.id === 'proposal-generator' && !selectedProposalType) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-primary">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>

          <ProposalTypeSelector onTypeSelect={setSelectedProposalType} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-primary">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-3xl p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-100 mb-2">
                    {tileData.title}
                    {params.id === 'proposal-generator' && selectedProposalType && (
                      <span className="text-primary ml-2">
                        ({selectedProposalType === 'html' ? 'HTML Overview' : 'Markdown Proposal'})
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-400">{tileData.description}</p>
                </div>
                {params.id === 'proposal-generator' && (
                  <Button
                    variant="outline" 
                    onClick={() => setSelectedProposalType(null)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    Change Type
                  </Button>
                )}
              </div>
            </div>

            <GeneratorForm
              inputs={tileData.inputs}
              formData={formData}
              documents={documents}
              selectedProposalType={selectedProposalType}
              isTemplateLoading={isTemplateLoading}
              templateError={templateError}
              onInputChange={handleInputChange}
              onAddDocument={handleAddDocument}
              onRemoveDocument={handleRemoveDocument}
              onDocumentChange={handleDocumentChange}
            />
            
            <div className="flex items-center space-x-3 py-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLAIContext}
                  onChange={(e) => setIncludeLAIContext(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">Include LongevAI Context</span>
              </label>
            </div>

            <Button
              onClick={generatePrompt}
              disabled={!isFormValid()}
              className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Prompt
            </Button>
          </Card>
        </motion.div>
      </AnimatePresence>

      <ToastNotification
        show={showToast}
        linkButtonText={tileData.output.link_button_text}
        url={tileData.output.url}
      />
    </div>
  );
}