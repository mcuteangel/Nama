import { useState, useCallback } from 'react'; // Removed useEffect
import { PhoneNumberFormData, EmailAddressFormData, SocialLinkFormData } from '@/types/contact'; // Removed ContactFormValues
import { ErrorManager } from '@/lib/error-manager';
import { useSession } from '@/integrations/supabase/auth';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();

  const enqueueContactExtraction = useCallback(async (text: string): Promise<{ success: boolean; error: string | null; suggestionId?: string }> => {
    setIsLoading(true);
    setError(null);

    if (!session?.access_token) {
      ErrorManager.notifyUser('برای استخراج اطلاعات باید وارد شوید.', 'error');
      setIsLoading(false);
      return { success: false, error: 'کاربر احراز هویت نشده است.' };
    }

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/extract-contact-info`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ text }),
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
        ErrorManager.notifyUser('درخواست استخراج اطلاعات با موفقیت به صف اضافه شد.', 'success');
        return { success: true, error: null, suggestionId: responseData.ai_suggestion_id };
      } else {
        throw new Error('پاسخ نامعتبر از تابع Edge.');
      }
    } catch (err: any) {
      console.error("Error during contact info extraction enqueue:", err);
      setError(err.message || 'خطا در افزودن درخواست به صف استخراج اطلاعات.');
      ErrorManager.notifyUser(err.message || 'خطا در افزودن درخواست به صف استخراج اطلاعات.', 'error');
      return { success: false, error: err.message || 'خطا در افزودن درخواست به صف استخراج اطلاعات.' };
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  return { enqueueContactExtraction, isLoading, error };
}