import { useState, useEffect, useCallback, useRef } from 'react';
import { pipeline, env } from '@xenova/transformers';
import { ContactFormValues, PhoneNumberFormData, EmailAddressFormData, SocialLinkFormData } from '@/types/contact';
import { ErrorManager } from '@/lib/error-manager';

// Set environment variables for Transformers.js
(env as any).allowLocalModels = false; // Prefer remote models for initial download
(env as any).useWebWorkers = true; // Use Web Workers for better performance
(env as any).backends.onnx.wasm.numThreads = 1; // Limit threads for broader compatibility

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

const initialExtractedInfo: ExtractedContactInfo = {
  firstName: '',
  lastName: '',
  company: '',
  position: '',
  phoneNumbers: [],
  emailAddresses: [],
  socialLinks: [],
  notes: '',
};

export function useContactExtractor() {
  const [extractor, setExtractor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const extractorRef = useRef<any>(null);

  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Load the NER pipeline
        // Using a smaller, more efficient DistilBERT model
        extractorRef.current = await pipeline('token-classification', 'Xenova/distilbert-base-multilingual-cased-ner-hrl');
        setExtractor(extractorRef.current);
        ErrorManager.notifyUser('مدل استخراج اطلاعات با موفقیت بارگذاری شد.', 'success');
      } catch (err: any) {
        console.error("Failed to load NER model:", err);
        setError('خطا در بارگذاری مدل هوش مصنوعی برای استخراج اطلاعات.');
        ErrorManager.notifyUser('خطا در بارگذاری مدل هوش مصنوعی برای استخراج اطلاعات.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (!extractorRef.current) {
      loadModel();
    }

    return () => {
      // Clean up if necessary, though Transformers.js handles much of this
    };
  }, []);

  const extractContactInfo = useCallback(async (text: string): Promise<ExtractedContactInfo> => {
    if (!extractor) {
      ErrorManager.notifyUser('مدل هوش مصنوعی هنوز بارگذاری نشده است.', 'error');
      return initialExtractedInfo;
    }

    const extracted: ExtractedContactInfo = { ...initialExtractedInfo, notes: text }; // Default notes to full text

    try {
      // 1. Use NER for named entities (Person, Organization)
      const output = await extractor(text);

      let currentFirstName = '';
      let currentLastName = '';
      let currentCompany = '';
      let currentPosition = ''; // Position is harder to extract with generic NER

      // Group tokens into entities
      const entities: { entity: string; word: string; start: number; end: number }[] = [];
      let currentEntity: { entity: string; word: string; start: number; end: number } | null = null;

      for (const item of output) {
        const entityType = item.entity.split('-')[1]; // e.g., PER, ORG
        const isBeginning = item.entity.startsWith('B-');

        if (isBeginning && currentEntity) {
          entities.push(currentEntity);
          currentEntity = null;
        }

        if (isBeginning || (currentEntity && item.entity.endsWith(currentEntity.entity.split('-')[1]))) {
          if (!currentEntity) {
            currentEntity = { entity: entityType, word: item.word.replace(/##/g, ''), start: item.start, end: item.end };
          } else {
            currentEntity.word += item.word.replace(/##/g, '');
            currentEntity.end = item.end;
          }
        } else if (currentEntity) {
          entities.push(currentEntity);
          currentEntity = null;
        }
      }
      if (currentEntity) {
        entities.push(currentEntity);
      }

      // Process extracted entities
      for (const entity of entities) {
        if (entity.entity === 'PER') {
          // Simple heuristic for first/last name
          const nameParts = entity.word.split(' ').filter(Boolean);
          if (nameParts.length > 0) {
            if (!currentFirstName) {
              currentFirstName = nameParts[0];
              if (nameParts.length > 1) {
                currentLastName = nameParts.slice(1).join(' ');
              }
            } else if (!currentLastName) {
              currentLastName = nameParts.join(' ');
            }
          }
        } else if (entity.entity === 'ORG') {
          if (!currentCompany) {
            currentCompany = entity.word;
          }
        }
      }

      extracted.firstName = currentFirstName;
      extracted.lastName = currentLastName;
      extracted.company = currentCompany;

      // 2. Use Regex for Phone Numbers
      // Regex for Iranian mobile numbers (starting with 09)
      const phoneRegex = /(09\d{9})/g;
      let match;
      const phoneNumbers: PhoneNumberFormData[] = [];
      const processedTextForNotes = text; // Keep original text for notes initially

      while ((match = phoneRegex.exec(processedTextForNotes)) !== null) {
        phoneNumbers.push({ phone_type: 'mobile', phone_number: match[0], extension: null });
      }
      extracted.phoneNumbers = phoneNumbers;

      // 3. Use Regex for Email Addresses
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
      const emailAddresses: EmailAddressFormData[] = [];
      while ((match = emailRegex.exec(processedTextForNotes)) !== null) {
        emailAddresses.push({ email_type: 'personal', email_address: match[0] });
      }
      extracted.emailAddresses = emailAddresses;

      // 4. Simple keyword extraction for position (can be improved)
      const positionKeywords = ['مدیر', 'مهندس', 'کارشناس', 'رئیس', 'معاون', 'مدیرعامل', 'برنامه‌نویس', 'توسعه‌دهنده', 'طراح'];
      for (const keyword of positionKeywords) {
        if (text.includes(keyword) && !extracted.position) {
          extracted.position = keyword; // Take the first one found
          break;
        }
      }

      // 5. Remove extracted info from notes to keep only remaining text
      let remainingNotes = text;
      [extracted.firstName, extracted.lastName, extracted.company, extracted.position]
        .filter(Boolean)
        .forEach(item => {
          remainingNotes = remainingNotes.replace(item, '').trim();
        });
      extracted.phoneNumbers.forEach(p => {
        remainingNotes = remainingNotes.replace(p.phone_number, '').trim();
      });
      extracted.emailAddresses.forEach(e => {
        remainingNotes = remainingNotes.replace(e.email_address, '').trim();
      });

      extracted.notes = remainingNotes.replace(/\s\s+/g, ' ').trim(); // Clean up multiple spaces

      ErrorManager.notifyUser('اطلاعات با موفقیت استخراج شد.', 'success');
      return extracted;
    } catch (err: any) {
      console.error("Error during contact info extraction:", err);
      ErrorManager.notifyUser('خطا در استخراج اطلاعات از متن.', 'error');
      return initialExtractedInfo;
    }
  }, [extractor]);

  return { extractContactInfo, isLoading, error };
}