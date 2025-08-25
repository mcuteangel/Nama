import { supabase } from '@/integrations/supabase/client';
import { ErrorManager } from '@/lib/error-manager';
import { ExtractedContactInfo } from '@/hooks/use-contact-extractor'; // Re-use the type from the hook
import { invalidateCache } from '@/utils/cache-helpers'; // Import invalidateCache

export interface AISuggestion {
  id: string;
  user_id: string;
  extracted_data: ExtractedContactInfo;
  status: 'pending_review' | 'accepted' | 'discarded' | 'edited';
  created_at: string;
  reviewed_at: string | null;
  ai_processing_queue_id: string | null;
}

// Removed ContactNameForGenderSuggestion and GenderSuggestionResult interfaces
// as they are no longer needed in the service layer.

export const AISuggestionsService = {
  async getPendingSuggestions(userId: string): Promise<{ data: AISuggestion[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return { data: data as AISuggestion[], error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'AISuggestionsService.getPendingSuggestions', userId });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async updateSuggestionStatus(suggestionId: string, status: 'accepted' | 'discarded' | 'edited'): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('کاربر احراز هویت نشده است.');
      }

      const { error } = await supabase
        .from('ai_suggestions')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', suggestionId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
      // Invalidate the cache for pending suggestions after status update
      invalidateCache(`ai_pending_suggestions_${user.id}`);
      return { success: true, error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'AISuggestionsService.updateSuggestionStatus', suggestionId, status });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async deleteSuggestion(suggestionId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('کاربر احراز هویت نشده است.');
      }

      const { error } = await supabase
        .from('ai_suggestions')
        .delete()
        .eq('id', suggestionId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
      // Invalidate the cache for pending suggestions after deletion
      invalidateCache(`ai_pending_suggestions_${user.id}`);
      return { success: true, error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'AISuggestionsService.deleteSuggestion', suggestionId });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },

  // Removed getGenderSuggestions as it's no longer using an Edge Function.
  // The logic will be moved to the client-side component.
};