import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserManagementService } from '../services/user-management-service';
import {
  CreateUserInput,
  UpdateUserRoleInput,
  UpdateUserProfileInput,
  UpdateUserPasswordInput,
  UserListFilters
} from '../types/user.types';

/**
 * هوک برای دریافت لیست کاربران با قابلیت فیلتر و صفحه‌بندی
 */
export const useUsers = (filters?: UserListFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      // TODO: اضافه کردن متد getUsers با فیلتر به سرویس
      const { data, error } = await UserManagementService.getAllUsers();
      if (error) throw new Error(error);

      let filteredUsers = data || [];

      // اعمال فیلتر جستجو
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.email.toLowerCase().includes(searchTerm) ||
          (user.first_name && user.first_name.toLowerCase().includes(searchTerm)) ||
          (user.last_name && user.last_name.toLowerCase().includes(searchTerm))
        );
      }

      // اعمال فیلتر نقش
      if (filters?.role && filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }

      // اعمال مرتب‌سازی
      if (filters?.sortBy) {
        filteredUsers.sort((a, b) => {
          const order = filters.sortOrder === 'desc' ? -1 : 1;

          switch (filters.sortBy) {
            case 'email':
              return a.email.localeCompare(b.email) * order;
            case 'first_name':
              return ((a.first_name || '') + (a.last_name || '')).localeCompare((b.first_name || '') + (b.last_name || '')) * order;
            case 'last_name':
              return ((a.last_name || '') + (a.first_name || '')).localeCompare((b.last_name || '') + (b.first_name || '')) * order;
            case 'created_at':
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime() * order;
            default:
              return 0;
          }
        });
      }

      return filteredUsers;
    },
    staleTime: 5 * 60 * 1000, // 5 دقیقه
  });
};

/**
 * هوک برای ایجاد کاربر جدید
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => UserManagementService.createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * هوک برای به‌روزرسانی نقش کاربر
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserRoleInput) => UserManagementService.updateUserRole(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * هوک برای به‌روزرسانی پروفایل کاربر
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => UserManagementService.updateUserProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * هوک برای به‌روزرسانی رمز عبور کاربر
 */
export const useUpdateUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserPasswordInput) => UserManagementService.updateUserPassword(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * هوک برای حذف کاربر
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserManagementService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
