import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserManagementService } from '../services/user-management-service';
import {
  CreateUserInput,
  UpdateUserRoleInput,
  UpdateUserProfileInput,
  UserListFilters,
  UserProfile
} from '../types/user.types';

/**
 * هوک برای دریافت لیست کاربران با قابلیت فیلتر و صفحه‌بندی
 */
// تنظیمات کش در خود useQuery اعمال می‌شود

export const useUsers = (filters?: UserListFilters) => {
  return useQuery<UserProfile[], Error>({
    queryKey: ['users', filters],
    queryFn: async ({ queryKey }) => {
      // استخراج پارامترهای فیلتر از queryKey
      const [_, queryFilters] = queryKey as [string, UserListFilters | undefined];
      
      // دریافت داده‌ها از سرویس
      const { data, error } = await UserManagementService.getAllUsers();
      if (error) throw new Error(error);

      let filteredUsers = [...(data || [])];

      // اعمال فیلتر جستجو
      if (queryFilters?.search) {
        const searchTerm = queryFilters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.email.toLowerCase().includes(searchTerm) ||
          (user.first_name && user.first_name.toLowerCase().includes(searchTerm)) ||
          (user.last_name && user.last_name.toLowerCase().includes(searchTerm))
        );
      }

      // اعمال فیلتر نقش
      if (queryFilters?.role && queryFilters.role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === queryFilters.role);
      }

      // اعمال مرتب‌سازی
      if (queryFilters?.sortBy) {
        filteredUsers.sort((a, b) => {
          const order = queryFilters.sortOrder === 'desc' ? -1 : 1;

          switch (queryFilters.sortBy) {
            case 'email':
              return a.email.localeCompare(b.email) * order;
              return ((a.last_name || '') + (a.first_name || '')).localeCompare(
                (b.last_name || '') + (b.first_name || '')
              ) * order;
            default:
              return 0;
          }
        });
      }

      // اعمال صفحه‌بندی
      const page = queryFilters?.page || 1;
      const limit = queryFilters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      return paginatedUsers;
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
      // باطل کردن کش مربوط به لیست کاربران
      queryClient.invalidateQueries({ 
        queryKey: ['users'],
        refetchType: 'active' // فقط کامپوننت‌های فعال را رفرش می‌کند
      });
    }
  });
};

/**
 * هوک برای به‌روزرسانی نقش کاربر
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateUserRoleInput) => 
      UserManagementService.updateUserRole({ userId: input.userId, role: input.role }),
    onSuccess: (_, variables) => {
      // به‌روزرسانی کش به صورت بهینه
      queryClient.setQueryData<UserProfile[]>(['users'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(user =>
          user.id === variables.userId 
            ? { ...user, role: variables.role } 
            : user
        );
      });
      
      // رفرش داده‌های کش‌شده
      queryClient.invalidateQueries({ 
        queryKey: ['users'],
        refetchType: 'active'
      });
    }
  });
};

/**
 * هوک برای به‌روزرسانی پروفایل کاربر
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => 
      UserManagementService.updateUserProfile({
        userId: input.userId,
        first_name: input.first_name,
        last_name: input.last_name
      }),
    onSuccess: (_, variables) => {
      // به‌روزرسانی کش به صورت بهینه
      queryClient.setQueryData<UserProfile[]>(['users'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(user =>
          user.id === variables.userId 
            ? { 
                ...user, 
                first_name: variables.first_name, 
                last_name: variables.last_name 
              } 
            : user
        );
      });
      
      // رفرش داده‌های کش‌شده
      queryClient.invalidateQueries({ 
        queryKey: ['users'],
        refetchType: 'active'
      });
    }
  });
};

/**
 * هوک برای به‌روزرسانی رمز عبور کاربر
 */
export const useUpdateUserPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { userId: string; newPassword: string }) => 
      UserManagementService.updateUserPassword(input.userId, input.newPassword),
    onSuccess: (_, variables) => {
      // می‌توانید در اینجا نوتیفیکیشن یا سایر عملیات مورد نیاز را اضافه کنید
      console.log('رمز عبور کاربر با موفقیت به‌روزرسانی شد');
      
      // رفرش داده‌های کش‌شده
      queryClient.invalidateQueries({ 
        queryKey: ['users'],
        refetchType: 'active'
      });
    },
    onError: (error) => {
      console.error('خطا در به‌روزرسانی رمز عبور:', error);
      // می‌توانید در اینجا مدیریت خطا را اضافه کنید
    }
  });
};

/**
 * هوک برای حذف کاربر
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => UserManagementService.deleteUser(userId),
    onSuccess: (_, userId) => {
      // حذف کاربر از کش به صورت بهینه
      queryClient.setQueryData<UserProfile[]>(['users'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter(user => user.id !== userId);
      });
      
      // رفرش داده‌های کش‌شده
      queryClient.invalidateQueries({ 
        queryKey: ['users'],
        refetchType: 'active'
      });
    }
  });
};
