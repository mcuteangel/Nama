import React from 'react';
import { useTranslation } from "react-i18next";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { LucideIcon } from 'lucide-react';

interface BaseListProps {
  data: any[];
  title: string;
  icon: LucideIcon;
  iconColor: string;
  emptyMessageKey: string;
  nameKey?: string;
  countKey?: string;
  className?: string;
}

const BaseList: React.FC<BaseListProps> = ({
  data,
  title,
  icon: Icon,
  iconColor,
  emptyMessageKey,
  nameKey = 'name',
  countKey = 'count',
  className = ""
}) => {
  const { t } = useTranslation();

  return (
    <ModernCard
      variant="glass"
      className={`rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/50 ${className}`}
      role="region"
      aria-labelledby={`list-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <ModernCardHeader className="pb-4">
        <ModernCardTitle
          id={`list-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
        >
          <div className={`p-2 rounded-xl bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('-500', '-400')} ${iconColor.replace('text-', 'to-').replace('-500', '-600')} shadow-lg`}>
            <Icon size={24} className="text-white" aria-hidden="true" />
          </div>
          {t(title)}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-72 overflow-y-auto custom-scrollbar space-y-3 relative">
        {data.length > 0 ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-xl pointer-events-none" />
            <div className="relative space-y-3">
              {data.map((item: any, index: number) => (
                <div
                  key={item.id || item[nameKey] || index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-background/80 to-background/60 hover:from-background hover:to-background/80 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 hover:scale-[1.02] border border-border/30"
                  role="listitem"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold shadow-sm">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-foreground">{item[nameKey]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-lg">{item[countKey]}</span>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Icon size={32} className="text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium" role="status">
                {t(emptyMessageKey)}
              </p>
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default React.memo(BaseList);