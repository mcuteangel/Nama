import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/lib/design-tokens";

interface NotesCardProps {
  notes?: string | null;
}

export const NotesCard = ({ notes }: NotesCardProps) => {
  const { t } = useTranslation();

  // Only render if there are notes
  if (!notes) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Background Glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${designTokens.colors.info[500]}20, ${designTokens.colors.primary[500]}20)`,
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
                background: designTokens.gradients.info,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Info size={20} style={{ color: 'white' }} />
            </div>
            <span style={{ color: 'white' }}>{t('contact_detail.notes')}</span>
          </h2>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="relative">
            {/* Paper texture background */}
            <div
              className="absolute inset-0 rounded-2xl opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <textarea
              value={notes}
              readOnly
              className="relative w-full px-4 py-4 rounded-2xl resize-none text-white placeholder-white/50"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                fontSize: designTokens.typography.sizes.base,
                fontFamily: designTokens.typography.fonts.primary,
                lineHeight: '1.6',
                minHeight: '180px',
              }}
              placeholder="یادداشتی وجود ندارد..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};