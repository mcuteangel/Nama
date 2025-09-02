import React from 'react';
import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";

interface PositionData {
  position: string;
  count: number;
}

interface TopPositionsListProps {
  data: PositionData[];
}

const TopPositionsList: React.FC<TopPositionsListProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <ModernCard variant="glass" className="rounded-xl p-4 col-span-1">
      <ModernCardHeader className="pb-2">
        <ModernCardTitle className="text-lg font-semibold flex items-center gap-2">
          <Briefcase size={20} className="text-orange-500" />
          {t('statistics.top_positions')}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-64 overflow-y-auto custom-scrollbar space-y-3">
        {data.length > 0 ? (
          data.map((position, index) => (
            <div 
              key={position.position} 
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <span className="font-medium">{position.position}</span>
              </div>
              <span className="font-bold text-primary">{position.count}</span>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('statistics.no_position_data')}</p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(TopPositionsList);