import React from 'react';
import { ContactCard } from '@/components/ui/ContactCard';
import { ContactSection } from '@/components/ui/ContactSection';
import { useTranslation } from 'react-i18next';
import { Database, Tags } from 'lucide-react';

interface CustomField {
  id: string;
  template_id: string;
  field_value: string;
  custom_field_templates: Array<{
    name: string;
    type: string;
    options?: string[];
  }>;
}

interface ContactDetailCustomFieldsProps {
  custom_fields: CustomField[];
}

export const ContactDetailCustomFields: React.FC<ContactDetailCustomFieldsProps> = ({ custom_fields }) => {
  const { t } = useTranslation();

  if (custom_fields.length === 0) {
    return null;
  }

  return (
    <ContactCard
      title={t('contact_detail.custom_fields')}
      icon={Database}
      iconColor="#ef4444"
    >
      <ContactSection variant="simple">
        <div className="space-y-3">
          {custom_fields.map((field) => (
            <div key={field.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tags size={16} className="text-slate-500" />
                <div className="bg-slate-50/40 dark:bg-slate-800/20 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {field.custom_field_templates?.[0]?.name || t('common.field')}:
                  </span>
                </div>
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100">{field.field_value}</span>
            </div>
          ))}
        </div>
      </ContactSection>
    </ContactCard>
  );
};
