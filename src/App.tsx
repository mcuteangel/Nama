import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddContact from "./pages/AddContact";
import Login from "./pages/Login";
import ContactDetail from "./pages/ContactDetail";
import Groups from "./pages/Groups";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader"; // Import MobileHeader
import BottomNavigationBar from "./components/BottomNavigationBar"; // Import BottomNavigationBar
import { SessionContextProvider, useSession } from "./integrations/supabase/auth.tsx";
import React from "react";
import { useIsMobile } from "./hooks/use-mobile";
import { cn } from "./lib/utils"; // Import cn for utility classes

const queryClient = new QueryClient();

// Component to handle authentication-based routing
const AuthRoutes = () => {
  const { session, isLoading } = useSession();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
        <p className="text-gray-700 dark:text-gray-300">در حال بررسی وضعیت احراز هویت...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {session ? (
        // Authenticated routes with conditional layout for mobile/desktop
        <Route
          path="/*" // Catch all authenticated routes
          element={
            <div className="flex flex-col min-h-screen">
              {isMobile ? (
                <>
                  <MobileHeader />
                  <div className="flex-grow pt-[72px] pb-16"> {/* Adjust padding for mobile header and bottom nav */}
                    <main>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/add-contact" element={<AddContact />} />
                        <Route path="/contacts/:id" element={<ContactDetail />} />
                        <Route path="/groups" element={<Groups />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                  <BottomNavigationBar />
                </>
              ) : (
                <>
                  <Sidebar /> {/* Render Sidebar for desktop */}
                  <div className="flex-grow mr-64"> {/* Adjust margin for sidebar on desktop */}
                    <main>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/add-contact" element={<AddContact />} />
                        <Route path="/contacts/:id" element={<ContactDetail />} />
                        <Route path="/groups" element={<Groups />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </>
              )}
            </div>
          }
        />
      ) : (
        // Unauthenticated routes - redirect all non-login paths to login
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

const App = () => {
  // Set document direction to RTL for Persian language
  React.useEffect(() => {
    document.documentElement.dir = 'rtl';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionContextProvider>
            <AuthRoutes />
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;