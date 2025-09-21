import { ClipboardList } from "lucide-react";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/lib/design-tokens";

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
    <div className="relative group">
      {/* Background Glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${designTokens.colors.secondary[500]}20, ${designTokens.colors.accent[500]}20)`,
          filter: 'blur(20px)',
        }}
      />

      {/* Main Card */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.02) 100%)`,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.2),
                     0 8px 16px -8px rgba(0, 0, 0, 0.1),
                     inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          }}
        >
          <h2 className="flex items-center gap-3 text-xl font-bold">
            <div
              className="p-2 rounded-xl"
              style={{
                background: designTokens.gradients.pink,
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
              }}
            >
              <ClipboardList size={20} style={{ color: 'white' }} />
            </div>
            <span style={{ color: 'white' }}>{t('contact_detail.custom_fields')}</span>
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {custom_fields.map((field) => (
            <div key={field.id} className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: designTokens.gradients.pink,
                  }}
                />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {field.custom_field_templates && field.custom_field_templates.length > 0
                    ? field.custom_field_templates[0].name
                    : t('contact_detail.unknown_field_name')}
                </span>
              </label>
              <div
                className="px-4 py-3 rounded-xl transition-all duration-300 group-hover/field:scale-[1.02]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ color: 'white', fontWeight: '500' }}>
                  {field.custom_field_templates && field.custom_field_templates.length > 0 && field.custom_field_templates[0].type === 'date'
                    ? formatDate(new Date(field.field_value), 'jYYYY/jMM/jDD')
                    : field.field_value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};