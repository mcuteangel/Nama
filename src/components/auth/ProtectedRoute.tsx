import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/integrations/supabase/auth';
import LoadingMessage from '../common/LoadingMessage'; // Import LoadingMessage

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { t } = useTranslation();
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingMessage message={t('loading_messages.auth_checking')} />;
  }

  if (!session || !session.user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;