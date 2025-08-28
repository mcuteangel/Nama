import React from 'react';
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";

interface TotalContactsCardProps {
  count: number | null;
}

const TotalContactsCard: React.FC<TotalContactsCardProps> = ({ count }) => {
  const { t } = useTranslation();
  return (
    <ModernCard variant="glass" className="rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[256px]">
      <ModernCardHeader className="pb-2">
        <ModernCardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users size={20} className="text-blue-500" />
          {t('statistics.total_contacts')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <p className="text-5xl font-bold">
          {count !== null ? count : '...'}
        </p>
      </ModernCardContent>
    </ModernCard>
  );
};

export default TotalContactsCard;