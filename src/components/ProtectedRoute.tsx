import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/integrations/supabase/auth';
import LoadingMessage from './LoadingMessage'; // Import LoadingMessage

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingMessage message="در حال بررسی وضعیت احراز هویت..." />;
  }

  if (!session || !session.user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;