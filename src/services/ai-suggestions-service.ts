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

interface ContactNameForGenderSuggestion {
  id: string;
  firstName: string;
  lastName: string;
}

interface GenderSuggestionResult {
  contactId: string;
  suggestedGender: 'male' | 'female' | 'not_specified';
}

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

  async getGenderSuggestions(contacts: ContactNameForGenderSuggestion[]): Promise<{ data: GenderSuggestionResult[] | null; error: string | null }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('No active session found. User must be logged in to get gender suggestions.');
      }

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/suggest-gender`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ contacts }),
      });

      if (!response.ok) {
        let errorBody = null;
        try {
          errorBody = await response.json();
        } catch (jsonParseError) {
          throw new Error(`HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
        }
        throw new Error(errorBody.error || `HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
      }

      const responseData = await response.json();

      return { data: responseData.suggestions as GenderSuggestionResult[], error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'AISuggestionsService.getGenderSuggestions', contacts });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  },
};