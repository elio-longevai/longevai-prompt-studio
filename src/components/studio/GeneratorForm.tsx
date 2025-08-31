'use client';

import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DocumentUploader, Document } from './DocumentUploader';

export interface TileInput {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'document_upload';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  default?: string;
}

interface GeneratorFormProps {
  inputs: TileInput[];
  formData: Record<string, string>;
  documents: Document[];
  selectedProposalType?: 'html' | 'markdown' | null;  // Kept for backward compatibility but unused
  isTemplateLoading?: boolean;
  templateError?: string | null;
  onInputChange: (id: string, value: string) => void;
  onAddDocument: () => void;
  onRemoveDocument: (index: number) => void;
  onDocumentChange: (index: number, field: 'name' | 'content', value: string) => void;
}

export function GeneratorForm({
  inputs,
  formData,
  documents,
  isTemplateLoading,
  templateError,
  onInputChange,
  onAddDocument,
  onRemoveDocument,
  onDocumentChange
}: Omit<GeneratorFormProps, 'selectedProposalType'>) {
  return (
    <div className="space-y-6">
      {inputs.map((input) => {
          // Hide custom template fields unless 'custom' is selected
          if ((input.id === 'custom_html_template' && formData.html_template !== 'custom') ||
              (input.id === 'custom_md_template' && formData.md_template !== 'custom')) {
            return null;
          }

          return (
            <Card key={input.id} className="bg-gray-800/50 border-gray-700 p-4">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {input.label}
                {input.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              
              {input.type === 'text' && (
                <input
                  type="text"
                  value={formData[input.id] || ''}
                  onChange={(e) => onInputChange(input.id, e.target.value)}
                  placeholder={input.placeholder}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-500 focus:border-primary focus:outline-none"
                />
              )}
              
              {input.type === 'textarea' && (
                <Textarea
                  value={formData[input.id] || ''}
                  onChange={(e) => onInputChange(input.id, e.target.value)}
                  placeholder={input.placeholder}
                  className="w-full min-h-[100px] bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-primary rounded-xl"
                />
              )}
              
              {input.type === 'select' && (
                <div>
                  <select
                    value={formData[input.id] || ''}
                    onChange={(e) => onInputChange(input.id, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-100 focus:border-primary focus:outline-none"
                  >
                    {input.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  
                  {/* Show loading/error feedback for template selects */}
                  {(input.id === 'html_template' || input.id === 'md_template') && (
                    <div className="mt-2">
                      {isTemplateLoading && (
                        <div className="flex items-center text-blue-400 text-sm">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full mr-2"></div>
                          Loading template...
                        </div>
                      )}
                      {templateError && (
                        <div className="text-red-400 text-sm">
                          {templateError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {input.type === 'document_upload' && (
                <DocumentUploader
                  documents={documents}
                  onAddDocument={onAddDocument}
                  onRemoveDocument={onRemoveDocument}
                  onDocumentChange={onDocumentChange}
                />
              )}
            </Card>
          );
        })}
    </div>
  );
}