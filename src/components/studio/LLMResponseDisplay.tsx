'use client';

import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';

interface LLMResponseDisplayProps {
  response: string;
  isLoading: boolean;
  error: string | null;
  refinementInput?: string;
  onRefinementInputChange?: (value: string) => void;
  onRefine?: () => void;
  isRefinementDisabled?: boolean;
}

export function LLMResponseDisplay({ 
  response, 
  isLoading, 
  error,
  refinementInput = '',
  onRefinementInputChange,
  onRefine,
  isRefinementDisabled = false
}: LLMResponseDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [editableResponse, setEditableResponse] = useState(response);

  // Update editable response when response changes
  React.useEffect(() => {
    setEditableResponse(response);
  }, [response]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableResponse);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onRefine && !isRefinementDisabled) {
        onRefine();
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ✨ AI Response
          {response && !isLoading && !error && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="ml-auto"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 rounded-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error occurred</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        ) : isLoading && !response ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : response ? (
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={editableResponse}
                onChange={(e) => setEditableResponse(e.target.value)}
                className="min-h-[200px] font-mono text-sm resize-vertical"
                placeholder="AI response will appear here..."
              />
              {isLoading && (
                <div className="absolute bottom-2 right-2 flex items-center gap-2 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Generating...
                </div>
              )}
            </div>
            
            {/* Refinement UI */}
            {onRefine && onRefinementInputChange && (
              <div className="flex gap-2">
                <Input
                  value={refinementInput}
                  onChange={(e) => onRefinementInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter refinement instructions..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={onRefine}
                  disabled={isRefinementDisabled}
                  className="bg-gradient-to-r from-primary to-green-400 hover:from-green-400 hover:to-primary text-black font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Refine
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}