'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';
import tilesData from '@/data/tiles.json';
import { templateLoader } from '@/lib/templateLoader';

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
  inputs: Array<{
    id: string;
    label: string;
    type: string;
    path?: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
    default?: string;
  }>;
  output: {
    copy_button_text: string;
    link_button_text: string;
    url: string;
  };
}

interface Document {
  name: string;
  content: string;
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

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Handle template loading when template selection changes
    if (id === 'html_template' || id === 'md_template') {
      loadTemplateContent(value);
    }
  };

  const loadTemplateContent = async (templateName: string) => {
    try {
      const content = await templateLoader.loadTemplate(templateName);
      setTemplateContent(content);
    } catch (error) {
      console.log('Could not load template:', error);
      setTemplateContent('');
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

  const handleFileUpload = async (index: number, file: File) => {
    const text = await file.text();
    handleDocumentChange(index, 'content', text);
    if (!documents[index].name) {
      handleDocumentChange(index, 'name', file.name.replace(/\.[^/.]+$/, ''));
    }
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

      tileData.inputs.forEach((input) => {
        if (input.type !== 'document_upload' && formData[input.id]) {
          userPrompt += `<${input.id}>\n${formData[input.id]}\n</${input.id}>\n\n`;
        }
      });

      if (documents.length > 0) {
        userPrompt += '<context_docs>\n';
        documents.forEach((doc) => {
          if (doc.name && doc.content) {
            const tagName = doc.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            userPrompt += `<${tagName}>\n${doc.content}\n</${tagName}>\n\n`;
          }
        });
        userPrompt += '</context_docs>\n';
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

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-3xl p-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-100 mb-2">{tileData.title}</h1>
              <p className="text-gray-400 mb-6">{tileData.description}</p>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">What type of proposal do you want to create?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="p-6 bg-gray-700/30 border-gray-600 hover:border-primary/50 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedProposalType('html')}
                >
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-2xl mx-auto w-fit">
                      <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">HTML Overview</h3>
                    <p className="text-gray-400 text-sm">For creating a high-level, visually impressive web-based summary.</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="p-6 bg-gray-700/30 border-gray-600 hover:border-primary/50 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedProposalType('markdown')}
                >
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-2xl mx-auto w-fit">
                      <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Detailed Markdown Proposal</h3>
                    <p className="text-gray-400 text-sm">For generating a comprehensive, structured document based on a template.</p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </Card>
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

            <div className="space-y-6">
              {tileData.inputs
                .filter((input) => {
                  if (params.id !== 'proposal-generator') return true;
                  return input.path === 'both' || input.path === selectedProposalType;
                })
                .map((input) => {
                  // Hide custom template fields unless 'custom' is selected
                  if ((input.id === 'custom_html_template' && formData.html_template !== 'custom') ||
                      (input.id === 'custom_md_template' && formData.md_template !== 'custom')) {
                    return null;
                  }
                  
                  return (
                    <div key={input.id}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {input.label}
                        {input.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {input.type === 'text' && (
                        <input
                          type="text"
                          value={formData[input.id] || ''}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={input.placeholder}
                          className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-500 focus:border-primary focus:outline-none"
                        />
                      )}
                      
                      {input.type === 'textarea' && (
                        <Textarea
                          value={formData[input.id] || ''}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={input.placeholder}
                          className="w-full min-h-[100px] bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-primary rounded-xl"
                        />
                      )}
                      
                      {input.type === 'select' && (
                        <select
                          value={formData[input.id] || ''}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-100 focus:border-primary focus:outline-none"
                        >
                          {input.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {input.type === 'document_upload' && (
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <Card key={index} className="bg-gray-700/30 border-gray-600 p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-grow space-y-3">
                            <input
                              type="text"
                              value={doc.name}
                              onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                              placeholder="Document name"
                              className="w-full px-3 py-1 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-primary focus:outline-none"
                            />
                            <Textarea
                              value={doc.content}
                              onChange={(e) => handleDocumentChange(index, 'content', e.target.value)}
                              placeholder="Paste content here..."
                              className="w-full min-h-[80px] bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-primary rounded-lg"
                            />
                            <div className="relative">
                              <input
                                type="file"
                                id={`file-upload-${index}`}
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(index, e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <label
                                htmlFor={`file-upload-${index}`}
                                className="inline-flex items-center px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-300 text-sm font-medium cursor-pointer hover:bg-gray-600/50 hover:border-primary/50 transition-all duration-200"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Choose File
                              </label>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDocument(index)}
                            className="text-red-500 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={handleAddDocument}
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Add Document
                    </Button>
                  </div>
                        )}
                      
                    </div>
                  )
                })}
              
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
          </div>
        </Card>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 0 }}
            className="fixed bottom-8 right-8 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Check className="w-5 h-5 text-green-500" />
              <p className="text-gray-100 font-medium">Prompt is copied!</p>
            </div>
            <a
              href={tileData.output.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              {tileData.output.link_button_text}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}