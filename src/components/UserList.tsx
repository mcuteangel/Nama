import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User as UserIcon, PlusCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserManagementService } from "@/services/user-management-service";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorManager } from "@/lib/error-manager";
import UserForm from "./UserForm";
import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/supabase/auth";
import FormDialogWrapper from "./FormDialogWrapper"; // Import the new wrapper
import LoadingMessage from "./LoadingMessage"; // Import LoadingMessage
import CancelButton from "./CancelButton"; // Import CancelButton
import { fetchWithCache, invalidateCache } from "@/utils/cache-helpers"; // Import fetchWithCache

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
  const { t } = useTranslation();
  const { session } = useSession(); // Get session to invalidate cache

  const onSuccessDelete = useCallback(() => {
    ErrorManager.notifyUser(t('user_management.user_deleted_success'), 'success');
    invalidateCache(`user_list_${session?.user?.id}`); // Invalidate cache after successful delete
    onUserDeleted();
  }, [t, onUserDeleted, session]);

  const onErrorDelete = useCallback((err) => {
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
    <Card className="flex items-center justify-between p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] bg-white dark:bg-gray-800">
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
            <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600/50 transition-all duration-200">
              <Edit size={20} />
            </Button>
          </DialogTrigger>
          <FormDialogWrapper> {/* Use the new wrapper */}
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

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600/50 transition-all duration-200" disabled={isDeleting}>
              <Trash2 size={20} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-xl p-6 bg-white dark:bg-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-100">{t('user_management.confirm_delete_title')}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                {t('user_management.confirm_delete_description', { email: user.email })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <CancelButton onClick={() => {}} text={t('common.cancel')} /> {/* Use CancelButton */}
              <AlertDialogAction onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" disabled={isDeleting}>{t('common.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};

const UserList: React.FC = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { t } = useTranslation();

  const onSuccessDeleteList = useCallback(() => {
    // This callback is for the individual item's delete, the cache invalidation is handled there.
    // We just need to refetch the list here.
    fetchUsers();
  }, []);

  const onErrorDeleteList = useCallback((err) => {
    ErrorManager.logError(err, { component: 'UserList', action: 'deleteUser' });
  }, []);

  // This useErrorHandler is for the DELETE operation
  const {
    isLoading: isDeleting,
    executeAsync: executeDelete,
  } = useErrorHandler(null, {
    maxRetries: 3,
    retryDelay: 1000,
    showToast: true,
    customErrorMessage: t('user_management.error_deleting_user'),
    onSuccess: onSuccessDeleteList,
    onError: onErrorDeleteList,
  });

  const onSuccessFetchUsers = useCallback((result: { data: UserProfile[] | null; error: string | null; fromCache: boolean }) => {
    if (result && !result.fromCache) {
      ErrorManager.notifyUser(t('user_management.users_loaded_success'), 'success');
    }
  }, [t]);

  const onErrorFetchUsers = useCallback((err) => {
    ErrorManager.logError(err, { component: 'UserList', action: 'fetchUsers' });
  }, []);

  // New useErrorHandler for FETCHING users
  const {
    isLoading: loadingUsers,
    executeAsync: executeFetchUsers,
  } = useErrorHandler<{ data: UserProfile[] | null; error: string | null; fromCache: boolean }>(null, { // Explicitly define TResult here
    maxRetries: 3,
    retryDelay: 1000,
    showToast: false, // IMPORTANT: Set to false to control toast manually
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
      ErrorManager.notifyUser(t('user_management.admin_access_required'), 'error');
      return;
    }

    const cacheKey = `user_list_${session.user.id}`; // Add cache key for user list
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
      return { data, error: null, fromCache }; // Ensure error: null is returned
    });
  }, [session, isSessionLoading, executeFetchUsers, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loadingUsers) {
    return <LoadingMessage message={t('user_management.loading_users')} />;
  }

  if (session?.user?.user_metadata.role !== 'admin') {
    return (
      <div className="text-center text-red-500 dark:text-red-400 p-4">
        <p>{t('user_management.admin_access_required')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <PlusCircle size={20} className="me-2" />
              {t('user_management.add_new_user')}
            </span>
          </Button>
        </DialogTrigger>
        <FormDialogWrapper> {/* Use the new wrapper */}
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
        <p className="text-center text-gray-500 dark:text-gray-400">{t('user_management.no_users_found')}</p>
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