'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Plus } from 'lucide-react';

export interface Document {
  name: string;
  content: string;
}

interface DocumentUploaderProps {
  documents: Document[];
  onAddDocument: () => void;
  onRemoveDocument: (index: number) => void;
  onDocumentChange: (index: number, field: 'name' | 'content', value: string) => void;
}

export function DocumentUploader({ 
  documents, 
  onAddDocument, 
  onRemoveDocument, 
  onDocumentChange 
}: DocumentUploaderProps) {
  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onDocumentChange(index, 'content', content);
      if (!documents[index].name) {
        onDocumentChange(index, 'name', file.name);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      {documents.map((doc, index) => (
        <Card key={index} className="bg-gray-700/30 border-gray-600 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-grow space-y-3">
              <input
                type="text"
                placeholder="Document name"
                value={doc.name}
                onChange={(e) => onDocumentChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-gray-100 placeholder-gray-400 text-sm focus:border-primary focus:outline-none"
              />
              <div className="relative">
                <Textarea
                  placeholder="Paste document content here..."
                  value={doc.content}
                  onChange={(e) => onDocumentChange(index, 'content', e.target.value)}
                  className="w-full min-h-[80px] bg-gray-600/50 border-gray-500 text-gray-100 placeholder-gray-400 text-sm resize-none"
                />
                <div className="absolute top-2 right-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".txt,.md,.json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(index, file);
                      }}
                      className="hidden"
                    />
                    <div className="p-1 bg-primary/20 hover:bg-primary/30 rounded text-primary transition-colors">
                      <Upload className="w-3 h-3" />
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveDocument(index)}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
      
      <Button
        type="button"
        variant="ghost"
        onClick={onAddDocument}
        className="w-full border-2 border-dashed border-gray-600 hover:border-primary/50 text-gray-400 hover:text-primary py-3 bg-transparent hover:bg-primary/5"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Context Document
      </Button>
    </div>
  );
}