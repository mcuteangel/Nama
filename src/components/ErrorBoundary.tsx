import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback onRetry={this.handleRetry} error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onRetry: () => void;
  error?: Error;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ onRetry, error }) => {
  const { t } = useTranslation();

  return (
    <Card className="glass rounded-xl shadow-sm border border-red-200 dark:border-red-800">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle size={24} />
          {t('common.error_occurred', 'Something went wrong')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          {/* i18n-ally-ignore */}
          {t('common.error_description', 'An unexpected error occurred. Please try again.')}
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <summary className="cursor-pointer font-medium">{t('error.technical_details', 'Technical Details')}</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        
        <div className="flex justify-center gap-2">
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            {t('common.retry', 'Try Again')}
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="default"
          >
            {t('common.reload_page', 'Reload Page')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};



export default ErrorBoundary;