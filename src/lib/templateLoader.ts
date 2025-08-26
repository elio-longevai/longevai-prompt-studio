// Template loader for proposal generator using fetch to load from the same origin
export const templateLoader = {
  async loadTemplate(templateName: string): Promise<string> {
    if (templateName === 'custom') {
      return '';
    }
    
    try {
      // For now, we'll use a placeholder template approach
      // In a production app, templates could be stored in a database or API
      const templateMappings: Record<string, string> = {
        'general.html': '<html><!-- General HTML Template Placeholder --></html>',
        'maa.html': '<html><!-- MAA HTML Template Placeholder --></html>',
        'myactiveage.md': '# MyActiveAge Template\nTemplate content will be loaded here.',
        'qualevita.md': '# QualeVita Template\nTemplate content will be loaded here.'
      };
      
      return templateMappings[templateName] || '';
    } catch (error) {
      console.log('Could not load template:', error);
      return '';
    }
  }
};