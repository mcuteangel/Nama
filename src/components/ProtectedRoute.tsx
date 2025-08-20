import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/integrations/supabase/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    // Optionally, render a loading spinner or placeholder
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
        <p className="text-gray-700 dark:text-gray-300">در حال بررسی وضعیت احراز هویت...</p>
      </div>
    );
  }

  if (!session) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;