import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Contacts';
import Login from './pages/Login';
import AddContact from './pages/AddContact';
import ContactDetail from './pages/ContactDetail';
import EditContact from './pages/EditContact'; // Import EditContact
import Groups from './pages/Groups';
import { SessionContextProvider } from './integrations/supabase/auth';
import { supabase } from './integrations/supabase/client';
import MobileHeader from './components/MobileHeader';
import BottomNavigationBar from './components/BottomNavigationBar';
import Sidebar from './components/Sidebar';
import { Toaster } from 'sonner';
import { cn } from './lib/utils';
import NotFound from './pages/NotFound';

// New component to handle routing and layout based on location
function AppLayout() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAuthPage = location.pathname === '/login';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!isAuthPage && (
        <>
          {isMobile ? <MobileHeader /> : <Sidebar />}
          {isMobile && <BottomNavigationBar />}
        </>
      )}
      <div className={cn(
        "flex-grow",
        !isAuthPage && (isMobile ? "pt-[64px] pb-16" : "pr-64")
      )}>
        <main className="h-full w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/add-contact" element={<AddContact />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/contacts/edit/:id" element={<EditContact />} /> {/* New route for editing */}
            <Route path="/groups" element={<Groups />} />
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
      <Toaster />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </SessionContextProvider>
  );
}