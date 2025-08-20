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
import Sidebar from "./components/Sidebar"; // Import Sidebar
import { SessionContextProvider, useSession } from "./integrations/supabase/auth.tsx";
import React from "react";
import { useIsMobile } from "./hooks/use-mobile"; // Import useIsMobile

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
        // Authenticated routes with Sidebar and Footer
        <Route
          path="/*" // Catch all authenticated routes
          element={
            <div className="flex flex-col min-h-screen">
              <Sidebar /> {/* Render Sidebar */}
              <div className={`flex-grow ${!isMobile ? 'mr-64' : 'mt-[72px]'}`}> {/* Adjust margin for sidebar on desktop, padding for mobile header */}
                <main>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/add-contact" element={<AddContact />} />
                    <Route path="/contacts/:id" element={<ContactDetail />} />
                    <Route path="/groups" element={<Groups />} />
                    {/* Catch-all for authenticated users for 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
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