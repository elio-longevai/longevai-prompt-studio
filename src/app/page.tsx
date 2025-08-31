'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import tilesData from '@/data/tiles.json';
import { useRef } from 'react';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0,
        delayChildren: 0
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 500
      }
    }
  };

  return (
    <div className="relative min-h-full">
      {/* Inspiring Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(140,198,63,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(140,198,63,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(140,198,63,0.04),transparent_50%)]" />
      </div>

      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            animate={{
              y: [0, -60, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 3,
            }}
            style={{
              left: `${25 + (i * 25)}%`,
              top: `${40 + Math.sin(i) * 15}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10">
        {/* Compact Hero Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-primary via-green-300 to-emerald-400 bg-clip-text text-transparent">
              LongevAI
            </span>
            {" "}
            <span className="text-gray-100">
              Prompt Studio
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-green-400/10 rounded-full border border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-gray-200 font-medium">Ready to create something extraordinary?</span>
          </motion.div>
        </div>

        {/* Enhanced Tiles Grid */}
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {tilesData.map((tile) => {
            let IconComponent = Icons.FileText;
            
            // Safely get the icon component
            if (tile.icon === 'Presentation') IconComponent = Icons.Presentation;
            else if (tile.icon === 'Mail') IconComponent = Icons.Mail;
            else if (tile.icon === 'FileText') IconComponent = Icons.FileText;
            else if (tile.icon === 'Users') IconComponent = Icons.Users;
            else if (tile.icon === 'Code') IconComponent = Icons.Code;
            
            return (
              <motion.div key={tile.id} variants={item}>
                <Link href={`/${tile.id}`}>
                  <motion.div
                    whileHover={{ 
                      y: -6,
                      transition: { type: 'spring', damping: 30, stiffness: 500 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full"
                  >
                    <Card className="relative p-8 h-full bg-gray-800/50 backdrop-blur-md border border-gray-700/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-200 rounded-3xl cursor-pointer group overflow-hidden">
                      {/* Enhanced hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      
                      {/* Subtle shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-500 ease-out" />
                      
                      <div className="relative flex flex-col items-center text-center space-y-6">
                        <motion.div 
                          className="p-5 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-150"
                          whileHover={{ 
                            scale: 1.05,
                            transition: { type: 'spring', damping: 20, stiffness: 400 }
                          }}
                        >
                          <IconComponent className="w-12 h-12 text-primary group-hover:text-green-300 transition-colors duration-150" />
                          
                          {/* Icon glow effect */}
                          <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-150" />
                        </motion.div>
                        
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-gray-100 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-green-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-150">
                            {tile.title}
                          </h3>
                          
                          <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed transition-colors duration-150">
                            {tile.description}
                          </p>
                        </div>

                        {/* Subtle success indicator */}
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100"
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                        />
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