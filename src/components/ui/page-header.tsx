import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({
  title,
  description,
  showBackButton = true,
  backButtonLabel = 'بازگشت',
  className,
  children,
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const isRtl = document.documentElement.dir === 'rtl';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full h-9 w-9"
              aria-label={backButtonLabel}
            >
              <BackIcon className="h-5 w-5" />
              <span className="sr-only">{backButtonLabel}</span>
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {children}
        </div>
      </div>
    </div>
  );
};
