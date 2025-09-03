import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChartErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <ChartErrorFallback
        title={this.props.title}
        icon={this.props.icon}
        iconColor={this.props.iconColor}
        error={this.state.error}
        onRetry={this.handleRetry}
      />;
    }

    return this.props.children;
  }
}

interface FallbackProps {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  error?: Error;
  onRetry: () => void;
}

const ChartErrorFallback: React.FC<FallbackProps> = ({ title, icon: Icon, iconColor, error, onRetry }) => {
  const { t } = useTranslation();

  return (
    <ModernCard
      variant="glass"
      className="rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/50"
    >
      <ModernCardHeader className="pb-4">
        <ModernCardTitle className="text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${iconColor.replace('text-', 'from-').replace('-500', '-400')} ${iconColor.replace('text-', 'to-').replace('-500', '-600')} shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>
          {t(title)}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="h-72 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {t('statistics.chart_error')}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('statistics.chart_error_description')}
            </p>
            {error && (
              <details className="text-left mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  {t('common.details', 'جزئیات')}
                </summary>
                <pre className="text-xs bg-muted/50 p-2 rounded mt-1 overflow-auto max-h-20">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
          <Button
            onClick={onRetry}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.retry', 'تلاش مجدد')}
          </Button>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};

const ChartErrorBoundary: React.FC<Props> = (props) => (
  <ChartErrorBoundaryClass {...props} />
);

export default ChartErrorBoundary;