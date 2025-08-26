'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Copy, Save, Check } from 'lucide-react';
import tilesData from '@/data/tiles.json';

export default function AdminPage() {
  const [tiles, setTiles] = useState(tilesData);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleTileChange = (index: number, field: string, value: string) => {
    const updatedTiles = [...tiles];
    (updatedTiles[index] as Record<string, unknown>)[field] = value;
    setTiles(updatedTiles);
    setSaved(false);
  };

  const handleInputChange = (tileIndex: number, inputIndex: number, field: string, value: string | boolean) => {
    const updatedTiles = [...tiles];
    (updatedTiles[tileIndex].inputs[inputIndex] as Record<string, unknown>)[field] = value;
    setTiles(updatedTiles);
    setSaved(false);
  };

  const handleSaveChanges = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(tiles, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const generateExamplePrompt = (tile: typeof tiles[0]) => {
    let userPrompt = '<longevai_context>\n[LAI Context Content]\n</longevai_context>\n\n';
    
    tile.inputs.forEach((input) => {
      if (input.type === 'document_upload') {
        userPrompt += '<context_docs>\n';
        userPrompt += '  <document_name>\n    [Document content]\n  </document_name>\n';
        userPrompt += '</context_docs>\n\n';
      } else {
        userPrompt += `<${input.id}>\n  [${input.label} content]\n</${input.id}>\n\n`;
      }
    });
    
    return userPrompt.trim();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-4 text-gray-400 hover:text-primary">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">Configure prompt generators</p>
          </div>
        </div>

        <div className="space-y-8">
          {tiles.map((tile, tileIndex) => (
            <Card key={tile.id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-2xl p-4">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-primary mb-2">{tile.title}</h2>
                <p className="text-gray-400 text-sm">ID: {tile.id}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={tile.title}
                    onChange={(e) => handleTileChange(tileIndex, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-100 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={tile.description}
                    onChange={(e) => handleTileChange(tileIndex, 'description', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-100 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt</label>
                  <Textarea
                    value={tile.system_prompt}
                    onChange={(e) => handleTileChange(tileIndex, 'system_prompt', e.target.value)}
                    className="w-full min-h-[150px] bg-gray-700/50 border-gray-600 text-gray-100 focus:border-primary rounded-xl font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Example User Prompt Structure</label>
                  <pre className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-green-400 text-xs overflow-x-auto">
                    {generateExamplePrompt(tile)}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Inputs</h3>
                  <div className="space-y-3">
                    {tile.inputs.map((input, inputIndex) => (
                      <Card key={input.id} className="bg-gray-700/30 border-gray-600 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400">ID</label>
                            <input
                              type="text"
                              value={input.id}
                              onChange={(e) => handleInputChange(tileIndex, inputIndex, 'id', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-100 text-sm focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Label</label>
                            <input
                              type="text"
                              value={input.label}
                              onChange={(e) => handleInputChange(tileIndex, inputIndex, 'label', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-100 text-sm focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Type</label>
                            <select
                              value={input.type}
                              onChange={(e) => handleInputChange(tileIndex, inputIndex, 'type', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-100 text-sm focus:border-primary focus:outline-none"
                            >
                              <option value="text">Text</option>
                              <option value="textarea">Textarea</option>
                              <option value="select">Select</option>
                              <option value="document_upload">Document Upload</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={input.required || false}
                                onChange={(e) => handleInputChange(tileIndex, inputIndex, 'required', e.target.checked)}
                                className="rounded border-gray-600 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-gray-300">Required</span>
                            </label>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Output Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Copy Button Text</label>
                      <input
                        type="text"
                        value={tile.output.copy_button_text}
                        onChange={(e) => {
                          const updatedTiles = [...tiles];
                          updatedTiles[tileIndex].output.copy_button_text = e.target.value;
                          setTiles(updatedTiles);
                        }}
                        className="w-full px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Link Button Text</label>
                      <input
                        type="text"
                        value={tile.output.link_button_text}
                        onChange={(e) => {
                          const updatedTiles = [...tiles];
                          updatedTiles[tileIndex].output.link_button_text = e.target.value;
                          setTiles(updatedTiles);
                        }}
                        className="w-full px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">URL</label>
                      <input
                        type="text"
                        value={tile.output.url}
                        onChange={(e) => {
                          const updatedTiles = [...tiles];
                          updatedTiles[tileIndex].output.url = e.target.value;
                          setTiles(updatedTiles);
                        }}
                        className="w-full px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleSaveChanges}
            className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-3 rounded-xl"
          >
            {saved ? (
              <>
                <Check className="mr-2 w-5 h-5" />
                Changes Saved to State
              </>
            ) : (
              <>
                <Save className="mr-2 w-5 h-5" />
                Save Changes
              </>
            )}
          </Button>

          <Card className="bg-gray-800/50 border-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Export Configuration</h3>
            <p className="text-sm text-gray-400 mb-4">
              Copy the updated JSON content below and manually replace the contents of <code className="bg-gray-700 px-2 py-1 rounded">src/data/tiles.json</code> in the codebase.
            </p>
            <div className="relative">
              <pre className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-green-400 text-xs overflow-x-auto max-h-96">
                <code>{JSON.stringify(tiles, null, 2)}</code>
              </pre>
              <Button
                onClick={handleCopyJSON}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 w-4 h-4" />
                    Copy JSON
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}