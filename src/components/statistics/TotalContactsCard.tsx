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
      className="rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[256px]"
    >
      <ModernCardHeader className="pb-2">
        <ModernCardTitle className="text-lg font-semibold flex items-center gap-2 justify-center">
          <Users size={20} className="text-white" />
          <span className="text-white">{t('statistics.total_contacts')}</span>
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <p className={cn("text-5xl font-bold", count === null ? "text-gray-300" : "text-white")}>
          {count !== null ? count : '...'}
        </p>
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(TotalContactsCard);