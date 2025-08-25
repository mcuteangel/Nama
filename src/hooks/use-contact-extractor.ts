import { useState, useEffect, useCallback } from 'react';
import { ContactFormValues, PhoneNumberFormData, EmailAddressFormData, SocialLinkFormData } from '@/types/contact';
import { ErrorManager } from '@/lib/error-manager';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/auth'; // Import useSession to get the access token

interface ExtractedContactInfo {
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession(); // Get the current session

  const extractContactInfo = useCallback(async (text: string): Promise<ExtractedContactInfo | undefined> => {
    setIsLoading(true);
    setError(null);

    if (!session?.access_token) {
      ErrorManager.notifyUser('برای استخراج اطلاعات باید وارد شوید.', 'error');
      setIsLoading(false);
      return undefined;
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

      if (responseData && responseData.extractedInfo) {
        ErrorManager.notifyUser('اطلاعات با موفقیت استخراج شد.', 'success');
        return responseData.extractedInfo as ExtractedContactInfo;
      } else {
        throw new Error('پاسخ نامعتبر از تابع Edge.');
      }
    } catch (err: any) {
      console.error("Error during contact info extraction:", err);
      setError(err.message || 'خطا در استخراج اطلاعات از متن.');
      ErrorManager.notifyUser(err.message || 'خطا در استخراج اطلاعات از متن.', 'error');
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [session]); // Depend on session to re-run if session changes

  return { extractContactInfo, isLoading, error };
}