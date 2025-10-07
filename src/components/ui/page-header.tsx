import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  className?: string;
  children?: React.ReactNode;
  onBackClick?: () => void;
}

export const PageHeader = ({
  title,
  description,
  showBackButton = true,
  backButtonLabel,
  className,
  children,
  onBackClick,
}: PageHeaderProps) => {
  const { t } = useTranslation();
  const defaultBackButtonLabel = t('common.back');
  const navigate = useNavigate();
  const isRtl = document.documentElement.dir === 'rtl';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative z-10 backdrop-blur-xl bg-white/30 dark:bg-gray-800/50 rounded-2xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/30 transform transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-0.5">
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBackClick || (() => navigate(-1))}
                  className="rounded-xl h-10 w-10 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/70 dark:hover:bg-gray-600/50"
                  aria-label={backButtonLabel || defaultBackButtonLabel}
                >
                  <BackIcon className="h-5 w-5" />
                  <span className="sr-only">{backButtonLabel || defaultBackButtonLabel}</span>
                </Button>
              )}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
