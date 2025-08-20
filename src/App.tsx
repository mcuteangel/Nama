import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Contacts';
import Login from './pages/Login';
import AddContact from './pages/AddContact';
import ContactDetail from './pages/ContactDetail';
import Groups from './pages/Groups';
import { SessionContextProvider } from './integrations/supabase/auth';
import { supabase } from './integrations/supabase/client';
import MobileHeader from './components/MobileHeader';
import BottomNavigationBar from './components/BottomNavigationBar';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
import { cn } from './lib/utils';

function App() {
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
    <SessionContextProvider supabaseClient={supabase}>
      <Toaster />
      <div className="flex flex-col min-h-screen bg-background">
        {!isAuthPage && (
          <>
            {isMobile ? <MobileHeader /> : <Sidebar />}
            {isMobile && <BottomNavigationBar />}
          </>
        )}
        <div className={cn(
          "flex-grow",
          !isAuthPage && (isMobile ? "pt-[64px] pb-16" : "pr-64") // Adjusted pt-[72px] to pt-[64px]
        )}>
          <main className="h-full w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800"> {/* Applied gradient here */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/add-contact" element={<AddContact />} />
              <Route path="/contacts/:id" element={<ContactDetail />} />
              <Route path="/groups" element={<Groups />} />
            </Routes>
          </main>
        </div>
      </div>
    </SessionContextProvider>
  );
}

export default App;