'use client';

import { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { MarkdownRenderer } from './MarkdownRenderer';

interface LLMResponseDisplayProps {
  response: string;
  isLoading: boolean;
  error: string | null;
}

export function LLMResponseDisplay({ response, isLoading, error }: LLMResponseDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
          <div className="relative">
            <MarkdownRenderer content={response} />
            {isLoading && (
              <div className="absolute bottom-0 right-0 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Generating...
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}