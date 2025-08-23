import { supabase } from '@/integrations/supabase/client';
import { ErrorManager } from '@/lib/error-manager';

interface UserSettings {
  user_id: string;
  gemini_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export const SettingsService = {
  async getUserSettings(userId: string): Promise<{ data: { gemini_api_key: string | null } | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('gemini_api_key')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }
      return { data: data || { gemini_api_key: null }, error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'SettingsService.getUserSettings', userId });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async updateGeminiApiKey(userId: string, apiKey: string | null): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          { user_id: userId, gemini_api_key: apiKey },
          { onConflict: 'user_id' }
        );

      if (error) {
        throw new Error(error.message);
      }
      return { success: true, error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'SettingsService.updateGeminiApiKey', userId });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },
};