import { useState, useCallback } from 'react';
import { PhoneNumberFormData, EmailAddressFormData, SocialLinkFormData } from '@/types/contact';
import { ErrorManager } from '@/lib/error-manager';
import { useSession } from '@/integrations/supabase/auth'; // Import useSession to get the access token
import { useTranslation } from 'react-i18next';

// Define ExtractedContactInfo here as it's the core output of the AI
export interface ExtractedContactInfo {
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phoneNumbers: PhoneNumberFormData[];
  emailAddresses: EmailAddressFormData[];
  socialLinks: SocialLinkFormData[];
  notes: string;
}

export function useContactExtractor() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession(); // Get the current session

  const enqueueContactExtraction = useCallback(async (text: string): Promise<{ success: boolean; error: string | null; suggestionId?: string }> => {
    setIsLoading(true);
    setError(null);

    if (!session?.access_token) {
      ErrorManager.notifyUser(t('errors.auth.please_sign_in'), 'error');
      setIsLoading(false);
      return { success: false, error: t('errors.auth.unauthenticated_user') };
    }

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/extract-contact-info`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // Use the session's access token
          'apikey': SUPABASE_ANON_KEY, // Use the anon key
        },
        body: JSON.stringify({ text }), // Ensure body is stringified JSON
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

      if (responseData.message) {
        ErrorManager.notifyUser(t('contact_extraction.extraction_queued'), 'success');
        return { success: true, error: null, suggestionId: responseData.ai_suggestion_id };
      } else {
        throw new Error(t('contact_extraction.invalid_edge_response'));
      }
    } catch (err: unknown) {
      console.error("Error during contact info extraction enqueue:", err);
      const errorMessage = err instanceof Error ? err.message : t('contact_extraction.queue_error');
      setError(errorMessage);
      ErrorManager.notifyUser(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [session, t]);

  return { enqueueContactExtraction, isLoading, error };
}