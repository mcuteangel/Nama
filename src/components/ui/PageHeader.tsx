import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { GlassButton, GradientButton } from "./glass-button";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription } from "@/components/ui/modern-card";
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from "./modern-tooltip";
import { useAppSettings } from "@/hooks/use-app-settings";

interface PageHeaderProps {
  title: string;
  description: string;
  onAddClick?: () => void;
  addButtonLabel?: string;
  addButtonIcon?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  onAddClick,
  addButtonLabel,
  addButtonIcon = <Plus size={20} />,
  showBackButton = true,
  className = "",
  children
}) => {
  const { settings } = useAppSettings();
  const isRTL = settings.language === 'fa';
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <ModernCard className="backdrop-blur-lg bg-opacity-80 p-5 rounded-2xl shadow-lg">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <ModernCardHeader className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {showBackButton && (
                  <GlassButton 
                    onClick={() => navigate(-1)}
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    aria-label={t('common.back', 'بازگشت')}
                  >
                    <ArrowLeft 
                      className={`w-5 h-5 transition-transform duration-300 ${isRTL ? 'rotate-180' : ''}`} 
                    />
                  </GlassButton>
                )}
                <ModernCardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </ModernCardTitle>
              </div>
              <ModernCardDescription className="text-gray-600 dark:text-gray-300">
                {description}
              </ModernCardDescription>
            </div>
            <div className="flex items-center gap-2">
              {onAddClick && (
                <ModernTooltip>
                  <ModernTooltipTrigger asChild>
                    <GradientButton
                      gradientType="primary"
                      onClick={onAddClick}
                      className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl text-white hover:text-white/90"
                      style={{
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {addButtonIcon}
                      {addButtonLabel && <span className="hidden sm:inline">{addButtonLabel}</span>}
                    </GradientButton>
                  </ModernTooltipTrigger>
                  {addButtonLabel && (
                    <ModernTooltipContent>
                      <p>{addButtonLabel}</p>
                    </ModernTooltipContent>
                  )}
                </ModernTooltip>
              )}
              
              {children}
            </div>
          </div>
        </ModernCardHeader>
      </motion.div>
    </ModernCard>
  );
};

export default PageHeader;
