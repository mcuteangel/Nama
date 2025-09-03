import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query-config';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/integrations/i18n';

// Import the refactored Settings page
import Settings from '@/pages/Settings';

// Mock session provider for preview
const MockSessionProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MockSessionProvider>
            <BrowserRouter>
              <TooltipProvider>
                <div className="min-h-screen bg-background">
                  <Settings />
                </div>
              </TooltipProvider>
            </BrowserRouter>
          </MockSessionProvider>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;