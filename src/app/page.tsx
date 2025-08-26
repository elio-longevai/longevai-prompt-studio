'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import tilesData from '@/data/tiles.json';

export default function HomePage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent mb-4"
        >
          LongevAI Prompt Studio
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.02 }}
          className="text-gray-400 text-lg"
        >
          Generate specialized prompts with our intelligent tools
        </motion.p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {tilesData.map((tile) => {
          let IconComponent = Icons.FileText;
          
          // Safely get the icon component
          if (tile.icon === 'Presentation') IconComponent = Icons.Presentation;
          else if (tile.icon === 'Mail') IconComponent = Icons.Mail;
          else if (tile.icon === 'FileText') IconComponent = Icons.FileText;
          else if (tile.icon === 'Users') IconComponent = Icons.Users;
          
          return (
            <motion.div key={tile.id} variants={item}>
              <Link href={`/${tile.id}`}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <Card className="p-6 h-full bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-primary transition-all duration-300 rounded-3xl cursor-pointer group hover:shadow-lg hover:shadow-primary/20">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-100 group-hover:text-primary transition-colors">
                        {tile.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {tile.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}