import { CalendarClock } from "lucide-react";
import { useJalaliCalendar } from "@/hooks/use-jalali-calendar";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/lib/design-tokens";

interface TimestampsCardProps {
  created_at: string;
  updated_at: string;
}

export const TimestampsCard = ({ created_at, updated_at }: TimestampsCardProps) => {
  const { formatDate } = useJalaliCalendar();
  const { t } = useTranslation();

  return (
    <div className="relative group">
      {/* Background Glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${designTokens.colors.warning[500]}20, ${designTokens.colors.success[500]}20)`,
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
                background: designTokens.gradients.warning,
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              <CalendarClock size={20} style={{ color: 'white' }} />
            </div>
            <span style={{ color: 'white' }}>{t('contact_detail.important_times')}</span>
          </h2>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Created At */}
            <div className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: designTokens.colors.success[400],
                  }}
                />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {t('contact_detail.creation_date')}
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
                <div style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                  {formatDate(new Date(created_at), 'jYYYY/jMM/jDD')}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                  {formatDate(new Date(created_at), 'HH:mm')}
                </div>
              </div>
            </div>

            {/* Updated At */}
            <div className="group/field">
              <label className="flex items-center gap-2 mb-3 text-sm font-medium opacity-80">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: designTokens.colors.warning[400],
                  }}
                />
                <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {t('contact_detail.last_edit')}
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
                <div style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                  {formatDate(new Date(updated_at), 'jYYYY/jMM/jDD')}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                  {formatDate(new Date(updated_at), 'HH:mm')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};