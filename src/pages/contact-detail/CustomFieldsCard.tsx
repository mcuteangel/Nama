import { ModernCard } from "@/components/ui/modern-card";
import { ModernInput } from "@/components/ui/modern-input";
import { Label } from "@/components/ui/label";
import { ClipboardList } from "lucide-react";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { useTranslation } from "react-i18next";

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

interface CustomFieldsCardProps {
  custom_fields: CustomField[];
}

export const CustomFieldsCard = ({ custom_fields }: CustomFieldsCardProps) => {
  const { formatDate } = useJalaliCalendar();
  const { t } = useTranslation();
  
  // Only render if there are custom fields
  if (custom_fields.length === 0) {
    return null;
  }

  return (
    <ModernCard 
      variant="glass" 
      hover="lift"
      className="h-full"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ClipboardList size={20} />
        {t('contact_detail.custom_fields')}
      </h2>
      <div className="space-y-4">
        {custom_fields.map((field) => (
          <div key={field.id}>
            <Label className="text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
              {field.custom_field_templates && field.custom_field_templates.length > 0
                ? field.custom_field_templates[0].name
                : t('contact_detail.unknown_field_name')}
            </Label>
            {field.custom_field_templates && field.custom_field_templates.length > 0 && field.custom_field_templates[0].type === 'date' ? (
              <ModernInput 
                value={formatDate(new Date(field.field_value), 'jYYYY/jMM/jDD')} 
                readOnly 
                variant="glass"
              />
            ) : (
              <ModernInput 
                value={field.field_value} 
                readOnly 
                variant="glass"
              />
            )}
          </div>
        ))}
      </div>
    </ModernCard>
  );
};