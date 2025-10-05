import { AISuggestionDisplay } from '@/types/ai-suggestions-display.types';
import { ContactExtractionSuggestion, SuggestionStatus } from '@/types/ai-suggestions.types';

export const mapToContactExtractionSuggestion = (
  display: AISuggestionDisplay
): ContactExtractionSuggestion => {
  return {
    id: display.id,
    type: 'contact_extraction',
    status: display.status as SuggestionStatus,
    priority: display.priority,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: undefined,
    tags: [],
    metadata: {},
    extractedData: display.extractedData,
    existingContact: display.existingContact,
    stats: display.stats,
    source: {
      text: display.source?.text || '',
      method: display.source?.method || 'text_input',
      confidence: display.confidence.score
    }
  };
};

export default {
  mapToContactExtractionSuggestion
};
