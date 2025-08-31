'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import tilesData from '@/data/tiles.json';
import { templateLoader } from '@/lib/templateLoader';
import { GeneratorForm, TileInput } from '@/components/studio/GeneratorForm';
import { ToastNotification } from '@/components/studio/ToastNotification';
import { Document } from '@/components/studio/DocumentUploader';
import { LLMResponseDisplay } from '@/components/studio/LLMResponseDisplay';

interface TileData {
  id: string;
  title: string;
  description: string;
  icon: string;
  system_prompt: string;
  inputs: TileInput[];
  output: {
    copy_button_text: string;
    link_button_text: string;
    url: string;
  };
}

interface ConversationMessage {
  role: 'user' | 'assistant';
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
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [refinementInput, setRefinementInput] = useState<string>('');
  const [templateContent, setTemplateContent] = useState<string>('');
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [llmResponse, setLlmResponse] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

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
    if (params.id === 'proposal-generator' || params.id === 'html-overview-generator') {
      const templateId = params.id === 'html-overview-generator' ? 'html_template' : 'md_template';
      const defaultTemplateName = formData[templateId];
      if (defaultTemplateName) {
        loadTemplateContent(defaultTemplateName);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, formData.html_template, formData.md_template]);

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
    
    return tileData.inputs.every((input) => {
      if (!input.required) return true;
      if (input.type === 'document_upload') return true;
      return formData[input.id] && formData[input.id].trim() !== '';
    });
  };

  const generatePrompt = (): string => {
    if (!tileData) return '';

    let finalPrompt = '';

    // 1. Get and format the system prompt
    let systemPromptContent = tileData.system_prompt || '';

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
    if (params.id === 'proposal-generator' || params.id === 'html-overview-generator') {
      const isHtml = params.id === 'html-overview-generator';
      const template = isHtml
        ? formData.custom_html_template || templateContent
        : formData.custom_md_template || templateContent;
      
      const templateTag = isHtml ? 'base_html_template' : 'markdown_template';
      const useCdata = isHtml;

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
    
    tileData.inputs.forEach((input) => {
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

    return finalPrompt.trim();
  };

  const handleCopyPrompt = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Function to clean up markdown code fences from the response
  const cleanMarkdownCodeFences = (text: string): string => {
    return text
      // Remove opening code fences (```html, ```javascript, ```, etc.)
      .replace(/^```\w*\n?/gm, '')
      // Remove closing code fences
      .replace(/\n?```$/gm, '')
      // Remove any remaining standalone ``` lines
      .replace(/^```$/gm, '');
  };

  const handleExecutePrompt = async () => {
    setIsExecuting(true);
    setLlmResponse('');
    setExecutionError(null);
    setConversationHistory([]);
    setRefinementInput('');

    try {
      const prompt = generatePrompt();
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let accumulator = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        accumulator += chunk;
        
        // Clean up markdown code fences and update the response
        const cleanedResponse = cleanMarkdownCodeFences(accumulator);
        setLlmResponse(cleanedResponse);
      }
      
      // Add to conversation history
      setConversationHistory([
        { role: 'user', content: prompt },
        { role: 'assistant', content: cleanMarkdownCodeFences(accumulator) }
      ]);
    } catch (error) {
      console.error('Execute prompt error:', error);
      setExecutionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsExecuting(false);
    }
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

  const handleRefinePrompt = async () => {
    if (!refinementInput.trim()) return;
    
    setIsExecuting(true);
    setExecutionError(null);

    try {
      // Construct a conversation with history and new refinement
      const messages = [
        ...conversationHistory,
        { role: 'user' as const, content: refinementInput }
      ];
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          conversationHistory: messages,
          systemPrompt: tileData.system_prompt 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let accumulator = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        accumulator += chunk;
        
        // Clean up markdown code fences and update the response
        const cleanedResponse = cleanMarkdownCodeFences(accumulator);
        setLlmResponse(cleanedResponse);
      }
      
      // Update conversation history
      setConversationHistory([
        ...messages,
        { role: 'assistant', content: cleanMarkdownCodeFences(accumulator) }
      ]);
      setRefinementInput('');
    } catch (error) {
      console.error('Refine prompt error:', error);
      setExecutionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="relative min-h-full">
      {/* Inspiring background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(140,198,63,0.05),transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.1, type: 'spring', damping: 30 }}
          >
            <motion.div
              whileHover={{ x: -2 }}
              className="mb-4"
            >
              <Link href="/">
                <Button variant="ghost" className="text-gray-400 hover:text-primary hover:bg-primary/5 transition-all duration-150 rounded-full px-4 py-2">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            >
              <Card className="relative bg-gray-800/60 backdrop-blur-lg border border-gray-700/50 hover:border-primary/40 rounded-3xl p-10 overflow-hidden group">
                {/* Subtle hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                
                {/* Header Section */}
                <div className="relative mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.h1 
                        className="text-4xl font-bold mb-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.05 }}
                      >
                        <span className="bg-gradient-to-r from-gray-100 to-gray-200 bg-clip-text text-transparent">
                          {tileData.title}
                        </span>
                      </motion.h1>
                      
                      <motion.p 
                        className="text-gray-300 text-lg leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0, duration: 0.05 }}
                      >
                        {tileData.description}
                      </motion.p>
                    </div>
                    
                  </div>
                </div>

                {/* Form Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0, duration: 0.1 }}
                >
                  <GeneratorForm
                    inputs={tileData.inputs}
                    formData={formData}
                    documents={documents}
                    isTemplateLoading={isTemplateLoading}
                    templateError={templateError}
                    onInputChange={handleInputChange}
                    onAddDocument={handleAddDocument}
                    onRemoveDocument={handleRemoveDocument}
                    onDocumentChange={handleDocumentChange}
                  />
                </motion.div>
                
                {/* Enhanced Toggle */}
                <motion.div 
                  className="flex items-center justify-center py-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0, duration: 0.1 }}
                >
                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={includeLAIContext}
                      onChange={(e) => setIncludeLAIContext(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-green-400 after:shadow-sm"></div>
                    <span className="ml-4 text-base font-medium text-gray-300 group-hover:text-gray-100 transition-colors">
                      Include LongevAI Context
                    </span>
                  </label>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0, duration: 0.1 }}
                  className="flex gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleExecutePrompt}
                      disabled={!isFormValid() || isExecuting}
                      className="relative w-full bg-gradient-to-r from-primary to-green-400 hover:from-green-400 hover:to-primary text-black font-bold text-lg py-4 rounded-2xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group shadow-lg hover:shadow-xl hover:shadow-primary/20"
                    >
                      {/* Subtle shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
                      
                      <span className="relative flex items-center justify-center gap-2">
                        {isExecuting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                        {isExecuting ? 'Executing...' : 'Execute Prompt'}
                      </span>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      onClick={handleCopyPrompt}
                      disabled={!isFormValid()}
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-150 rounded-2xl px-6 py-4"
                    >
                      Generate Prompt
                    </Button>
                  </motion.div>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* LLM Response Display */}
        <AnimatePresence>
          {(isExecuting || llmResponse || executionError) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.15 }}
              className="mt-6"
            >
              <LLMResponseDisplay
                response={llmResponse}
                isLoading={isExecuting}
                error={executionError}
                refinementInput={refinementInput}
                onRefinementInputChange={setRefinementInput}
                onRefine={handleRefinePrompt}
                isRefinementDisabled={!refinementInput.trim() || isExecuting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ToastNotification
          show={showToast}
          linkButtonText={tileData.output.link_button_text}
          url={tileData.output.url}
        />
      </div>
    </div>
  );
}