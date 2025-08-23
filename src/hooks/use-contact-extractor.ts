import { useState, useEffect, useCallback } from 'react';
import { ContactFormValues, PhoneNumberFormData, EmailAddressFormData, SocialLinkFormData } from '@/types/contact';
import { ErrorManager } from '@/lib/error-manager';
import { supabase } from '@/integrations/supabase/client';

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

  const extractContactInfo = useCallback(async (text: string): Promise<ExtractedContactInfo | undefined> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('extract-contact-info', {
        body: JSON.stringify({ text }), // Ensure body is stringified JSON
        headers: { 'Content-Type': 'application/json' },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data && data.extractedInfo) {
        ErrorManager.notifyUser('اطلاعات با موفقیت استخراج شد.', 'success');
        return data.extractedInfo as ExtractedContactInfo;
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
  }, []);

  return { extractContactInfo, isLoading, error };
}