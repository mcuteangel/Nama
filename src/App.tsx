import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient, networkUtils } from '@/lib/react-query-config';
import { AppErrorBoundary, AsyncErrorBoundary } from '@/components/EnhancedErrorBoundary';
import './rtl-fixes.css'; // Import RTL-specific fixes
// Import performance config utility in development
if (process.env.NODE_ENV === 'development') {
  import('@/utils/performance-config');
}
// Lazy load page components for better performance with preloading
const Home = React.lazy(() => import('./pages/Home'));
const Contacts = React.lazy(() => import('./pages/Contacts'));
const Login = React.lazy(() => import('./pages/Login'));
const AddContact = React.lazy(() => import('./pages/AddContact'));
const ContactDetail = React.lazy(() => import('./pages/ContactDetail'));
const EditContact = React.lazy(() => import('./pages/EditContact'));
const Groups = React.lazy(() => import('./pages/Groups'));
const CustomFields = React.lazy(() => import('./pages/CustomFields'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const Settings = React.lazy(() => 
  import('./pages/Settings').then(module => {
    // Preload related components
    import('./components/performance/BundleSizeMonitor');
    import('./components/performance/PerformanceDashboard');
    return module;
  })
);
const Statistics = React.lazy(() => import('./pages/Statistics'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const AISuggestions = React.lazy(() => import('./pages/AISuggestions'));
const RTLTestPage = React.lazy(() => import('./pages/RTLTestPage'));
const ModernUIShowcase = React.lazy(() => import('./pages/ModernUIShowcase'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
import { SessionContextProvider } from './integrations/supabase/auth';
import { supabase } from './integrations/supabase/client';
import MobileHeader from './components/layout/MobileHeader';
import BottomNavigationBar from './components/layout/BottomNavigationBar';
import Sidebar from './components/layout/Sidebar';
import LoadingMessage from './components/common/LoadingMessage';
import SuspenseWrapper from './components/common/SuspenseWrapper';
import { Toaster } from 'sonner';
import { ToastProvider as ModernToastProvider } from './components/ui/modern-toast';
import { cn } from './lib/utils';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useSession } from './integrations/supabase/auth';
import AccessibilityProvider from './components/AccessibilityProvider';
import KeyboardNavigationHandler from './components/KeyboardNavigationHandler';

function AppLayout() {
  const location = useLocation();
  const mobileBreakpoint = 768; // Tailwind's 'md' breakpoint
  const { i18n } = useTranslation();
  const { session } = useSession();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < mobileBreakpoint);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const direction = i18n.dir();
    document.documentElement.dir = direction;
    document.body.dir = direction;
  }, [i18n, i18n.language]);

  useEffect(() => {
    console.log("Current user role from session:", session?.user?.user_metadata?.role);
  }, [session]);

  // Network status monitoring for React Query
  useEffect(() => {
    const handleOnline = () => {
      console.log('App came online, resuming queries');
      networkUtils.resumeQueries();
    };

    const handleOffline = () => {
      console.log('App went offline');
      networkUtils.pauseQueries();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Route preloading on user interaction
  useEffect(() => {
    const preloadRoutes = () => {
      // Preload commonly accessed routes
      if (session) {
        import('./pages/Contacts');
        import('./pages/AddContact');
        import('./pages/Groups');
      }
    };

    // Preload after initial render
    const timer = setTimeout(preloadRoutes, 2000);
    return () => clearTimeout(timer);
  }, [session]);

  const isAuthPage = location.pathname === '/login';

  const mainContentPaddingRight = !isAuthPage && !isMobile
    ? (isSidebarOpen ? "pr-64" : "pr-20")
    : "";

  const isAdmin = session?.user?.user_metadata?.role === 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!isAuthPage && (
        <>
          {isMobile ? <MobileHeader /> : <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isAdmin={isAdmin} />}
          {isMobile && <BottomNavigationBar isAdmin={isAdmin} />}
        </>
      )}
      <div className={cn(
        "flex-grow",
        !isAuthPage && (isMobile ? "pt-[64px] pb-16" : mainContentPaddingRight)
      )}>
        <main className="h-full w-full flex flex-col items-stretch justify-center p-0 sm:p-4" id="main-content" role="main">
          <KeyboardNavigationHandler scope="global">
            <AsyncErrorBoundary>
              <SuspenseWrapper fallback={<LoadingMessage message="Loading page..." />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  {/* Protected Routes */}
                  <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                  <Route path="/add-contact" element={<ProtectedRoute><AddContact /></ProtectedRoute>} />
                  <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
                  <Route path="/contacts/edit/:id" element={<ProtectedRoute><EditContact /></ProtectedRoute>} />
                  <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                  <Route path="/custom-fields" element={<ProtectedRoute><CustomFields /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
                  <Route path="/ai-suggestions" element={<ProtectedRoute><AISuggestions /></ProtectedRoute>} />
                  <Route path="/rtl-test" element={<ProtectedRoute><RTLTestPage /></ProtectedRoute>} />
                  <Route path="/modern-ui-showcase" element={<ProtectedRoute><ModernUIShowcase /></ProtectedRoute>} />
                  {isAdmin && (
                    <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                  )}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SuspenseWrapper>
            </AsyncErrorBoundary>
          </KeyboardNavigationHandler>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AccessibilityProvider>
              <ModernToastProvider>
                <Toaster 
                  position="top-right" 
                  toastOptions={{
                    duration: 4000,
                    className: 'text-sm',
                  }}
                />
                <BrowserRouter>
                  <TooltipProvider>
                    <AppLayout />
                  </TooltipProvider>
                </BrowserRouter>
              </ModernToastProvider>
              {/* React Query DevTools - only in development */}
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools 
                  initialIsOpen={false}
                />
              )}
            </AccessibilityProvider>
          </ThemeProvider>
        </SessionContextProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}