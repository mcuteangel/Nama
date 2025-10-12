import React, { useEffect, useState, useCallback } from "react";
import { Edit, Trash2, User as UserIcon, PlusCircle, Users, Bug } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserManagementService } from "@/services/user-management-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import UserForm from "./UserForm";
import LoadingMessage from "../common/LoadingMessage";
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers";
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import StandardizedDeleteDialog from "@/components/common/StandardizedDeleteDialog";
import { GlassButton } from "@/components/ui/glass-button";
import { ModernCard } from "@/components/ui/modern-card";
import { useDebugMode } from '@/hooks/useDebugMode';
import { EdgeFunctionDebugger } from '@/utils/edge-function-debugger';
import { useSession } from "@/integrations/supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { FormDialogWrapper } from "../common";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

const UserItem = ({ user, onUserUpdated, onUserDeleted }: { user: UserProfile; onUserUpdated: () => void; onUserDeleted: () => void }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { session } = useSession();
  const { toast } = useToast();

  const onSuccessDelete = useCallback(() => {
    toast.success(t('user_management.user_deleted_success'));
    invalidateCache(`user_list_${session?.user?.id}`);
    onUserDeleted();
  }, [t, onUserDeleted, session, toast]);

  const onErrorDelete = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'UserList', action: 'deleteUser', userId: user.id });
  }, [user.id]);

  const {
    isLoading: isDeleting,
    executeAsync: executeDelete,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: t('user_management.error_deleting_user'),
    onSuccess: onSuccessDelete,
    onError: onErrorDelete,
  });

  const handleDelete = async () => {
    await executeDelete(async () => {
      const res = await UserManagementService.deleteUser(user.id);
      if (res.error) throw new Error(res.error);
    });
  };

  return (
    <ModernCard variant="glass" className="flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover-lift">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white dark:bg-blue-700">
          <UserIcon size={20} />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            {user.first_name || user.email} {user.last_name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {user.email}
          </p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {user.role === 'admin' ? t('user_management.role_admin') : t('user_management.role_user')}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <GlassButton variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200">
              <Edit size={20} />
            </GlassButton>
          </DialogTrigger>
          <FormDialogWrapper 
            title={t('user_management.edit_user_title', 'Edit User')}
            description={t('user_management.edit_user_description', 'Form for editing user information')}
          >
            <UserForm
              initialData={user}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                onUserUpdated();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </FormDialogWrapper>
        </Dialog>

        <GlassButton 
          variant="ghost" 
          size="icon" 
          className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDeleting}
        >
          {isDeleting ? <LoadingSpinner size={20} /> : <Trash2 size={20} />}
        </GlassButton>

        {/* Standardized Delete Dialog */}
        <StandardizedDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          title={t('user_management.confirm_delete_title')}
          description={t('user_management.confirm_delete_description', { email: user.email })}
          isDeleting={isDeleting}
        />
      </div>
    </ModernCard>
  );
};

const UserList: React.FC = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { isDebugMode } = useDebugMode();
  const { toast } = useToast();

  // Debug function for Edge Function testing
  const handleDebugConnection = async () => {
    console.log('🔍 Starting debug test...');
    toast.info(t('system_messages.connection_test_start'));
    
    const result = await EdgeFunctionDebugger.testConnection();
    const directResult = await EdgeFunctionDebugger.testDirectFetch();
    
    console.log('Debug results:', { connection: result, direct: directResult });
    
    if (result.success) {
      toast.success(t('system_messages.connection_success', { count: result.details.usersCount }));
    } else {
      toast.error(t('system_messages.connection_error', { error: result.details.error }));
      console.error('Debug details:', result.details);
    }
  };

  const onSuccessFetchUsers = useCallback((result: { data: UserProfile[] | null; error: string | null; fromCache: boolean }) => {
    if (result && !result.fromCache) {
      toast.success(t('user_management.users_loaded_success'));
    }
  }, [t, toast]);

  const onErrorFetchUsers = useCallback((err: Error) => {
    ErrorManager.logError(err, { component: 'UserList', action: 'fetchUsers' });
  }, []);

  const {
    isLoading: loadingUsers,
    executeAsync: executeFetchUsers,
  } = useErrorHandler<{ data: UserProfile[] | null; error: string | null; fromCache: boolean }>(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: false,
    customErrorMessage: t('user_management.error_loading_users'),
    onSuccess: onSuccessFetchUsers,
    onError: onErrorFetchUsers,
  });

  const fetchUsers = useCallback(async () => {
    if (isSessionLoading) {
      setUsers([]);
      return;
    }
    
    if (!session?.user) {
      setUsers([]);
      return;
    }
    
    if (session.user.user_metadata.role !== 'admin') {
      setUsers([]);
      toast.error(t('user_management.admin_access_required'));
      return;
    }

    const cacheKey = `user_list_${session.user.id}`;
    await executeFetchUsers(async () => {
      const { data, error, fromCache } = await fetchWithCache<UserProfile[]>(
        cacheKey,
        async () => {
          const res = await UserManagementService.getAllUsers();
          return { data: res.data, error: res.error };
        }
      );
      if (error) throw new Error(error);
      setUsers(data || []);
      return { data, error: null, fromCache };
    });
  }, [session, isSessionLoading, executeFetchUsers, t, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loadingUsers) {
    return <LoadingMessage message={t('user_management.loading_users')} />;
  }

  if (session?.user?.user_metadata.role !== 'admin') {
    return (
      <ModernCard variant="glass" className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{t('user_management.admin_access_required')}</p>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debug Button - Only show when debug mode is enabled */}
      {isDebugMode && (
        <GlassButton
          onClick={handleDebugConnection}
          variant="outline"
          className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium transition-all duration-300"
        >
          <Bug size={16} className="me-2" />
          {t('actions.test_connection')}
        </GlassButton>
      )}
      
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogTrigger asChild>
          <GlassButton
            variant="gradient-primary"
            className="w-full px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <PlusCircle size={20} className="me-2" />
              {t('user_management.add_new_user')}
            </span>
          </GlassButton>
        </DialogTrigger>
        <FormDialogWrapper 
          title={t('user_management.add_user_title', 'Add User')}
          description={t('user_management.add_user_description', 'Form for adding a new user')}
        >
            <UserForm
              onSuccess={() => {
                setIsAddUserDialogOpen(false);
                fetchUsers();
              }}
              onCancel={() => setIsAddUserDialogOpen(false)}
            />
          </FormDialogWrapper>
      </Dialog>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('user_management.no_users_found')}
          description={t('user_management.no_users_found_description')}
        />
      ) : (
        users.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            onUserUpdated={fetchUsers}
            onUserDeleted={fetchUsers}
          />
        ))
      )}
    </div>
  );
};

export default UserList;






