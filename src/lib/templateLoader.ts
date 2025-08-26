// Template loader for proposal generator using fetch to load from the same origin
export const templateLoader = {
  async loadTemplate(templateName: string): Promise<string> {
    if (!templateName || templateName === 'custom') {
      return ''; // Return empty for custom or invalid names
    }
    
    try {
      // Construct the full path to the template in the public directory
      const response = await fetch(`/templates/${templateName}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }

      const content = await response.text();
      return content;
    } catch (error) {
      console.error(`Could not load template "${templateName}":`, error);
      // Return a user-friendly error message or an empty string
      return `Error: Could not load template "${templateName}".`;
    }
  }
};