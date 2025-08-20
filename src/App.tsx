import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddContact from "./pages/AddContact";
import Login from "./pages/Login";
import { SessionContextProvider, useSession } from "./integrations/supabase/auth.tsx";
import React from "react"; // Import React

const queryClient = new QueryClient();

// Component to handle authentication-based routing
const AuthRoutes = () => {
  const { session, isLoading } = useSession();

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
        // Authenticated routes
        <>
          <Route path="/" element={<Index />} />
          <Route path="/add-contact" element={<AddContact />} />
          {/* Catch-all for authenticated users for 404 */}
          <Route path="*" element={<NotFound />} />
        </>
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