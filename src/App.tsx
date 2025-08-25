import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import Login from './pages/Login';
import AddContact from './pages/AddContact';
import ContactDetail from './pages/ContactDetail';
import EditContact from './pages/EditContact';
import Groups from './pages/Groups';
import CustomFields from './pages/CustomFields';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import UserManagement from './pages/UserManagement';
import AISuggestions from './pages/AISuggestions'; // Import AISuggestions page
import { SessionContextProvider } from './integrations/supabase/auth';
import { supabase } from './integrations/supabase/client';
import MobileHeader from './components/MobileHeader';
import BottomNavigationBar from './components/BottomNavigationBar';
import Sidebar from './components/Sidebar';
import { Toaster } from 'sonner';
import { cn } from './lib/utils';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useSession } from './integrations/supabase/auth';

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
    document.documentElement.dir = i18n.dir();
  }, [i18n.dir()]);

  useEffect(() => {
    console.log("Current user role from session:", session?.user?.user_metadata?.role);
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
        <main className="h-full w-full flex flex-col items-center justify-center p-4">
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
            <Route path="/ai-suggestions" element={<ProtectedRoute><AISuggestions /></ProtectedRoute>} /> {/* New AI Suggestions route */}
            {isAdmin && (
              <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster />
        <BrowserRouter>
          <TooltipProvider>
            <AppLayout />
          </TooltipProvider>
        </BrowserRouter>
      </ThemeProvider>
    </SessionContextProvider>
  );
}