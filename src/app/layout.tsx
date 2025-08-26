// ---- File: src/app/layout.tsx ----
// src/app/layout.tsx
'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Sparkles } from 'lucide-react' // Use Sparkles icon for Prompt Studio
import { motion } from 'framer-motion'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Improve font loading
  variable: '--font-inter', // Assign CSS variable
})



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`}>
      <head>
        <title>LongevAI Prompt Studio</title>
        <meta name="description" content="Generate specialized prompts for LongevAI projects." />
      </head>
      {/* Apply dark theme globally for this example */}
      <body className="dark bg-gray-950 text-gray-100 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-gray-950/70 backdrop-blur-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors duration-300">
              <Sparkles size={24} className="text-primary" />
              <span>Prompt Studio</span>
              <span className="text-sm font-normal text-gray-400 ml-1">by LongevAI</span>
            </Link>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={16} className="text-primary/80" />
              </motion.div>
              <span className="text-xs font-medium text-gray-400 tracking-wider uppercase">
                AI-Powered Creation
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area - Takes remaining height */}
        <main className="flex-grow overflow-hidden"> {/* Prevent main from scrolling */}
          {children}
        </main>

        {/* Footer removed for cleaner chat interface, or can be styled */}
        {/*
        <footer className="py-4 mt-auto border-t border-primary/10 bg-gray-950/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
                Powered by Next.js & Google Gemini
            </div>
        </footer>
        */}
      </body>
    </html>
  )
}
