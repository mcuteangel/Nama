import { supabase } from '@/integrations/supabase/client';
import { ErrorManager } from '@/lib/error-manager';

interface UserSettings {
  user_id: string;
  gemini_api_key: string | null;
  gemini_model: string | null; // Added gemini_model
  created_at: string;
  updated_at: string;
}

interface UpdateUserSettingsInput {
  userId: string;
  gemini_api_key?: string | null;
  gemini_model?: string | null; // Added gemini_model to update input
}

interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
}

export const SettingsService = {
  async getUserSettings(userId: string): Promise<{ data: { gemini_api_key: string | null; gemini_model: string | null } | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('gemini_api_key, gemini_model') // Select both fields
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }
      return { data: data || { gemini_api_key: null, gemini_model: null }, error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'SettingsService.getUserSettings', userId });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async updateUserSettings(input: UpdateUserSettingsInput): Promise<{ success: boolean; error: string | null }> {
    try {
      const { userId, gemini_api_key, gemini_model } = input;

      const updatePayload: { gemini_api_key?: string | null; gemini_model?: string | null } = {};
      if (gemini_api_key !== undefined) {
        updatePayload.gemini_api_key = gemini_api_key;
      }
      if (gemini_model !== undefined) {
        updatePayload.gemini_model = gemini_model;
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert(
          { user_id: userId, ...updatePayload },
          { onConflict: 'user_id' }
        );

      if (error) {
        throw new Error(error.message);
      }
      return { success: true, error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'SettingsService.updateUserSettings', input });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async listGeminiModels(): Promise<{ data: GeminiModel[] | null; error: string | null }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("No active session found. User must be logged in to list Gemini models.");
      }

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/list-gemini-models`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST', // Use POST for invoking Edge Functions
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({}), // Empty body for GET-like request
      });

      // Check if response is OK first
      if (!response.ok) {
        let errorBody = null;
        try {
          errorBody = await response.json();
        } catch (jsonParseError) {
          // If response is not JSON, just use status text
          throw new Error(`HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
        }
        throw new Error(errorBody.error || `HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
      }

      const responseData = await response.json();

      return { data: responseData.models as GeminiModel[], error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'SettingsService.listGeminiModels' });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  },
};