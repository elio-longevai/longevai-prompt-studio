'use client';

import { motion } from 'framer-motion';
import { FileText, Code } from 'lucide-react';

interface ProposalTypeSelectorProps {
  onTypeSelect: (type: 'html' | 'markdown') => void;
}

export function ProposalTypeSelector({ onTypeSelect }: ProposalTypeSelectorProps) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Proposal Generator</h1>
      <p className="text-gray-400 mb-12 text-lg">
        Choose the type of proposal you&apos;d like to generate
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTypeSelect('html')}
          className="cursor-pointer"
        >
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300">
            <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Code className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">HTML Overview</h3>
            <p className="text-gray-400 leading-relaxed">
              Generate a high-level, visually appealing HTML proposal overview perfect for initial client presentations
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTypeSelect('markdown')}
          className="cursor-pointer"
        >
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300">
            <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Detailed Markdown</h3>
            <p className="text-gray-400 leading-relaxed">
              Create a comprehensive, detailed Markdown proposal with complete project specifications
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}