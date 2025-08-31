'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToastNotificationProps {
  show: boolean;
  linkButtonText?: string;
  url?: string;
}

export function ToastNotification({ 
  show, 
  linkButtonText = "Open in AI Studio",
  url = "https://aistudio.google.com/prompts/new_chat"
}: ToastNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.15, type: 'spring', damping: 30 }}
          className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4 z-50"
        >
          <Check className="w-5 h-5" />
          <span className="font-medium">Prompt copied to clipboard!</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="bg-white/20 hover:bg-white/30 text-white border-0 ml-4"
          >
            {linkButtonText}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}