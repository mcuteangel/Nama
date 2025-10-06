/**
 * تعریف تایپ‌های مرتبط با مدیریت کاربران
 */

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin';
}

export interface UpdateUserRoleInput {
  userId: string;
  role: 'user' | 'admin';
}

export interface UpdateUserProfileInput {
  userId: string;
  first_name: string | null;
  last_name: string | null;
}

export interface UpdateUserPasswordInput {
  userId: string;
  newPassword: string;
}

export interface UpdateUserInput {
  userId: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: 'user' | 'admin';
}

export interface UserListFilters {
  search?: string;
  role?: 'user' | 'admin' | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'email' | 'first_name' | 'last_name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  data: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
