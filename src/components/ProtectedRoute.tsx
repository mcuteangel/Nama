import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/integrations/supabase/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    // در حال بررسی وضعیت احراز هویت، یک وضعیت بارگذاری نمایش داده شود
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-gray-700 dark:text-gray-300">در حال بررسی وضعیت احراز هویت...</p>
      </div>
    );
  }

  if (!session || !session.user) {
    // نشست فعال یا کاربر معتبری وجود ندارد، به صفحه ورود هدایت شود
    return <Navigate to="/login" replace />;
  }

  // کاربر احراز هویت شده است، محتوای فرزندان نمایش داده شود
  return <>{children}</>;
};

export default ProtectedRoute;