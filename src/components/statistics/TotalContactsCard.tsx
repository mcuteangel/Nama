import React from 'react';
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { cn } from '@/lib/utils';

interface TotalContactsCardProps {
  count: number | null;
}

const TotalContactsCard: React.FC<TotalContactsCardProps> = ({ count }) => {
  const { t } = useTranslation();

  return (
    <ModernCard
      variant="gradient-primary"
      className="rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[320px] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-2 border-0 relative overflow-hidden"
      role="region"
      aria-labelledby="total-contacts-title"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full blur-lg" />

      <ModernCardHeader className="pb-6 relative z-10">
        <ModernCardTitle
          id="total-contacts-title"
          className="text-xl font-bold flex items-center gap-3 justify-center"
        >
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Users size={28} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-white drop-shadow-sm">{t('statistics.total_contacts')}</span>
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="relative z-10">
        <div className="relative">
          <p
            className={cn(
              "text-7xl font-black transition-all duration-300",
              count === null ? "text-white/60" : "text-white drop-shadow-lg"
            )}
            aria-label={count !== null ? `${t('statistics.total_contacts')}: ${count}` : t('common.loading')}
          >
            {count !== null ? count.toLocaleString() : '...'}
          </p>
          {count !== null && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white/30 rounded-full" />
          )}
        </div>
        <p className="text-white/80 text-sm mt-4 font-medium">
          {t('statistics.contacts')}
        </p>
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(TotalContactsCard);