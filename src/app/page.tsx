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
    <div className="relative min-h-screen">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(140,198,63,0.03),transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Clean Hero Section */}
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
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Create professional prompts with our intelligent generator tools
          </motion.p>
        </div>

        {/* Clean Tiles Grid */}
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
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    className="h-full"
                  >
                    <Card className="relative p-8 h-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-primary/40 transition-all duration-300 rounded-2xl cursor-pointer group overflow-hidden">
                      {/* Subtle hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative flex flex-col items-center text-center space-y-6">
                        <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/15 transition-colors duration-300">
                          <IconComponent className="w-10 h-10 text-primary group-hover:text-green-400 transition-colors duration-300" />
                        </div>
                        
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold text-gray-100 group-hover:text-primary transition-colors duration-300">
                            {tile.title}
                          </h3>
                          
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {tile.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}