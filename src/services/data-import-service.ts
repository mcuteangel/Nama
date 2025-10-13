import { supabase } from '@/integrations/supabase/client';
import { invalidateCache } from '@/utils/cache-helpers';
import i18n from '@/integrations/i18n';
import { ContactCrudService } from './contact-crud-service'; // Updated import
import { CustomFieldTemplateService } from './custom-field-template-service'; // Updated import
import { ContactFormValues } from '@/types/contact';
import { ErrorManager } from '@/lib/error-manager';

interface ParsedContactRow {
  firstName: string;
  lastName: string;
  gender?: 'male' | 'female' | 'not_specified';
  position?: string;
  company?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
  birthday?: string;
  avatarUrl?: string;
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'any';
  phoneNumbers: Array<{ phone_type: string; phone_number: string; extension: string | null }>;
  emailAddresses: Array<{ email_type: string; email_address: string }>;
  socialLinks: Array<{ type: string; url: string }>;
  groupId?: string;
  customFields: Array<{ template_id: string; value: string }>;
}

export const DataImportService = {
  async importContactsFromCsv(csvContent: string, userId: string): Promise<{ success: boolean; importedCount: number; error: string | null }> {
    try {
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        return { success: false, importedCount: 0, error: i18n.t('errors.csv_empty_or_header_only') };
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1);

      const contactsToImport: ParsedContactRow[] = [];
      const customFieldTemplates = (await CustomFieldTemplateService.getAllCustomFieldTemplates()).data || []; // Updated service call
      const existingGroups = (await supabase.from('groups').select('id, name').eq('user_id', userId)).data || [];

      for (const row of rows) {
        const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, '')); // Split by comma, ignore commas inside double quotes

        if (values.length !== headers.length) {
          console.warn(i18n.t('errors.csv_row_mismatch', { row }));
          continue;
        }

        const contactData: Partial<ParsedContactRow> = {};
        const phoneNumbers: Array<{ phone_type: string; phone_number: string; extension: string | null }> = [];
        const emailAddresses: Array<{ email_type: string; email_address: string }> = [];
        const socialLinks: Array<{ type: string; url: string }> = [];
        const customFields: Array<{ template_id: string; value: string }> = [];
        let groupId: string | undefined;

        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          const value = values[i];

          if (!value) continue; // Skip empty values

          switch (header) {
            case 'نام': contactData.firstName = value; break;
            case 'نام خانوادگی': contactData.lastName = value; break;
            case 'جنسیت':
              if (value === 'مرد') contactData.gender = 'male';
              else if (value === 'زن') contactData.gender = 'female';
              else contactData.gender = 'not_specified';
              break;
            case 'سمت': contactData.position = value; break;
            case 'شرکت': contactData.company = value; break;
            case 'خیابان': contactData.street = value; break;
            case 'شهر': contactData.city = value; break;
            case 'استان': contactData.state = value; break;
            case 'کد پستی': contactData.zipCode = value; break;
            case 'کشور': contactData.country = value; break;
            case 'یادداشت‌ها': contactData.notes = value; break;
            case 'تاریخ تولد': contactData.birthday = value; break;
            case 'URL آواتار': contactData.avatarUrl = value; break;
            case 'روش ارتباط ترجیحی':
              if (value === 'ایمیل') contactData.preferredContactMethod = 'email';
              else if (value === 'تلفن') contactData.preferredContactMethod = 'phone';
              else if (value === 'پیامک') contactData.preferredContactMethod = 'sms';
              else if (value === 'هر کدام') contactData.preferredContactMethod = 'any';
              break;
            case 'شماره تلفن‌ها':
              value.split(';').forEach(phoneStr => {
                const match = phoneStr.match(/(.+)\s\((.+?)(?:\s-\sداخلی:\s(.+))?\)/);
                if (match) {
                  phoneNumbers.push({
                    phone_number: match[1].trim(),
                    phone_type: match[2].trim(),
                    extension: match[3] ? match[3].trim() : null,
                  });
                }
              });
              break;
            case 'ایمیل‌ها':
              value.split(';').forEach(emailStr => {
                const match = emailStr.match(/(.+)\s\((.+)\)/);
                if (match) {
                  emailAddresses.push({
                    email_address: match[1].trim(),
                    email_type: match[2].trim(),
                  });
                }
              });
              break;
            case 'لینک‌های اجتماعی':
              value.split(';').forEach(socialStr => {
                const parts = socialStr.split(':');
                if (parts.length >= 2) {
                  socialLinks.push({
                    type: parts[0].trim(),
                    url: parts.slice(1).join(':').trim(),
                  });
                }
              });
              break;
            case 'گروه': {
              const group = existingGroups.find(g => g.name === value);
              if (group) {
                groupId = group.id;
              }
              break;
            }
            default: {
              // Handle custom fields
              const template = customFieldTemplates.find(t => t.name === header);
              if (template) {
                customFields.push({ template_id: template.id!, value: value });
              }
              break;
            }
          }
        }

        if (contactData.firstName && contactData.lastName) {
          contactsToImport.push({
            ...contactData as ParsedContactRow,
            phoneNumbers,
            emailAddresses,
            socialLinks,
            customFields,
            groupId,
          });
        }
      }

      let importedCount = 0;
      for (const contact of contactsToImport) {
        const contactFormValues: ContactFormValues = {
          firstName: contact.firstName,
          lastName: contact.lastName,
          gender: contact.gender || 'not_specified',
          position: contact.position,
          company: contact.company,
          street: contact.street,
          city: contact.city,
          state: contact.state,
          zipCode: contact.zipCode,
          country: contact.country,
          notes: contact.notes,
          birthday: contact.birthday,
          avatarUrl: contact.avatarUrl,
          preferredContactMethod: contact.preferredContactMethod,
          phoneNumbers: contact.phoneNumbers,
          emailAddresses: contact.emailAddresses,
          socialLinks: contact.socialLinks,
          groupId: contact.groupId || null,
          customFields: contact.customFields,
          tags: [],
        };

        const { error } = await ContactCrudService.addContact(contactFormValues); // Updated service call
        if (error) {
          console.error(`Error importing contact ${contact.firstName} ${contact.lastName}:`, error);
          // Continue with other contacts even if one fails
        } else {
          importedCount++;
        }
      }

      invalidateCache(`contacts_list_${userId}_`);
      invalidateCache(`statistics_dashboard_${userId}`);

      return { success: true, importedCount, error: null };
    } catch (err: unknown) {
      ErrorManager.logError(err, { context: 'DataImportService.importContactsFromCsv' });
      return { success: false, importedCount: 0, error: ErrorManager.getErrorMessage(err) };
    }
  },
};