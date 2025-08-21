import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import Login from './pages/Login';
import AddContact from './pages/AddContact';
import ContactDetail from './pages/ContactDetail';
import EditContact from './pages/EditContact';
import Groups from './pages/Groups';
import { SessionContextProvider } from './integrations/supabase/auth';
import { supabase } from './integrations/supabase/client';
import MobileHeader from './components/MobileHeader';
import BottomNavigationBar from './components/BottomNavigationBar';
import Sidebar from './components/Sidebar';
import { Toaster } from 'sonner';
import { cn } from './lib/utils';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute'; // New import

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
    return () => window.removeEventListener('resize', handleResize); // Corrected event listener cleanup
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