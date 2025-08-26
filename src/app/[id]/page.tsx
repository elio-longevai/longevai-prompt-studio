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

    let finalPrompt = '';

    // 1. Get and format the system prompt
    let systemPromptContent = '';
    if (params.id === 'proposal-generator' && selectedProposalType) {
      systemPromptContent = tileData.system_prompts?.[selectedProposalType] || '';
    } else {
      systemPromptContent = tileData.system_prompt || '';
    }

    // Replace any placeholders within the system prompt
    Object.keys(formData).forEach((key) => {
      const placeholder = `{{${key.toUpperCase()}}}`;
      if (systemPromptContent.includes(placeholder)) {
        systemPromptContent = systemPromptContent.replace(new RegExp(placeholder, 'g'), formData[key]);
      }
    });

    if (systemPromptContent) {
      finalPrompt += `<system_instructions>\n${systemPromptContent}\n</system_instructions>\n\n`;
    }

    // 2. Add LongevAI context if enabled
    if (includeLAIContext) {
      finalPrompt += `<longevai_context>\n${longevaiContextContent || ''}\n</longevai_context>\n\n`;
    }

    // 3. Add proposal templates if applicable
    if (params.id === 'proposal-generator' && selectedProposalType) {
      const template = selectedProposalType === 'html'
        ? formData.custom_html_template || templateContent
        : formData.custom_md_template || templateContent;
      
      const templateTag = selectedProposalType === 'html' ? 'base_html_template' : 'markdown_template';
      const useCdata = selectedProposalType === 'html';

      if (template) {
        finalPrompt += `<${templateTag}>\n${useCdata ? '<![CDATA[\n' : ''}${template}${useCdata ? '\n]]>\n' : ''}\n</${templateTag}>\n\n`;
      }
    }

    // 4. Add all other regular inputs, excluding special ones handled elsewhere
    const mainInstructionId = params.id === 'proposal-generator' ? 'instructions' : 'task';
    const specialInputIds = new Set([
      mainInstructionId, 
      'comprehensiveness', // Handled in system prompt
      'html_template', 'custom_html_template', // Handled in templates
      'md_template', 'custom_md_template'      // Handled in templates
    ]);
    
    const relevantInputs = tileData.inputs.filter(input => {
      if (params.id !== 'proposal-generator') return true;
      return input.path === 'both' || input.path === selectedProposalType;
    });

    relevantInputs.forEach((input) => {
      if (!specialInputIds.has(input.id) && input.type !== 'document_upload' && formData[input.id]) {
        finalPrompt += `<${input.id}>\n${formData[input.id]}\n</${input.id}>\n\n`;
      }
    });

    // 5. Add context documents
    if (documents.length > 0) {
      let docsContent = '';
      documents.forEach((doc) => {
        if (doc.name && doc.content) {
          const tagName = doc.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/\s+/g, '_');
          docsContent += `  <${tagName}>\n${doc.content}\n  </${tagName}>\n`;
        }
      });
      if (docsContent) {
        finalPrompt += `<context_docs>\n${docsContent}</context_docs>\n\n`;
      }
    }

    // 6. Add the main instruction at the very end
    if (formData[mainInstructionId]) {
      finalPrompt += `<${mainInstructionId}>\n${formData[mainInstructionId]}\n</${mainInstructionId}>\n`;
    }

    // 7. Copy to clipboard and show toast
    navigator.clipboard.writeText(finalPrompt.trim());
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

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-2xl p-8">
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