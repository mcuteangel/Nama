import { supabase } from '@/integrations/supabase/client';
import { ErrorManager } from '@/lib/error-manager';
import { 
  UserProfile, 
  CreateUserInput, 
  UpdateUserRoleInput, 
  UpdateUserProfileInput, 
  UpdateUserPasswordInput, 
  UserListFilters,
  UpdateUserInput
} from '../types/user.types';

class UserManagementServiceClass {
  getUsers(filters: UserListFilters): { data: UserProfile[] | null; error: string | null; } | PromiseLike<{ data: UserProfile[] | null; error: string | null; }> {
      throw new Error('Method not implemented.');
  }
  getUserById(userId: string): { data: UserProfile | null; error: string | null; } | PromiseLike<{ data: UserProfile | null; error: string | null; }> {
      throw new Error('Method not implemented.');
  }
  updateUser(userData: UpdateUserInput): { data: UserProfile | null; error: string | null; } | PromiseLike<{ data: UserProfile | null; error: string | null; }> {
      throw new Error('Method not implemented.');
  }
  /**
   * دریافت تمامی کاربران
   */
  async getAllUsers(): Promise<{ data: UserProfile[] | null; error: string | null }> {
    try {
      console.log('UserManagementService: Calling get-all-users Edge Function...');
      
      // بررسی وجود نشست
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        throw new Error('No active session found. User must be logged in.');
      }
      
      console.log('Session found, user:', session.user?.email);
      
      // فراخوانی تابع Edge برای دریافت تمامی کاربران
      const { data, error } = await supabase.functions.invoke('get-all-users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      console.log('Edge Function response:', { data, error });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Edge Function error: ${error.message || error}`);
      }

      if (!data || !data.users) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from Edge Function');
      }

      console.log('Successfully fetched users:', data.users.length);
      return { data: data.users as UserProfile[], error: null };
    } catch (err) {
      console.error('UserManagementService.getAllUsers error:', err);
      ErrorManager.logError(err, { context: 'UserManagementService.getAllUsers' });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  }

  /**
   * ایجاد کاربر جدید
   */
  async createUser(input: CreateUserInput): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const { email, password, first_name, last_name, role } = input;

      // فراخوانی تابع Edge برای ایجاد کاربر
      const { data, error } = await supabase.functions.invoke('create-user-with-role', {
        body: JSON.stringify({ email, password, first_name, last_name, role }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        throw new Error(error.message);
      }

      // بازگشت اطلاعات کاربر ایجاد شده
      const newUser: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.user_metadata?.first_name || null,
        last_name: data.user.user_metadata?.last_name || null,
        role: data.user.user_metadata?.role || 'user',
        created_at: data.user.created_at
      };

      return { data: newUser, error: null };
    } catch (err) {
      console.error('UserManagementService.createUser error:', err);
      ErrorManager.logError(err, { context: 'UserManagementService.createUser', input });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  }

  /**
   * به‌روزرسانی نقش کاربر
   */
  async updateUserRole(input: UpdateUserRoleInput): Promise<{ success: boolean; error: string | null }> {
    try {
      const { userId, role } = input;
      
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role }
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('UserManagementService.updateUserRole error:', err);
      ErrorManager.logError(err, { context: 'UserManagementService.updateUserRole', input });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  }

  /**
   * به‌روزرسانی پروفایل کاربر
   */
  async updateUserProfile(input: UpdateUserProfileInput): Promise<{ success: boolean; error: string | null }> {
    try {
      const { userId, first_name, last_name } = input;
      
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { first_name, last_name }
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('UserManagementService.updateUserProfile error:', err);
      ErrorManager.logError(err, { context: 'UserManagementService.updateUserProfile', input });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  }

  /**
   * به‌روزرسانی رمز عبور کاربر
   */
  async updateUserPassword(input: UpdateUserPasswordInput): Promise<{ success: boolean; error: string | null }> {
    try {
      const { userId, newPassword } = input;
      
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('UserManagementService.updateUserPassword error:', err);
      ErrorManager.logError(err, { 
        context: 'UserManagementService.updateUserPassword', 
        userId: input.userId 
      });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  }

  /**
   * حذف کاربر
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // ابتدا بررسی می‌کنیم کاربر جاری نباشد
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id === userId) {
        throw new Error('Cannot delete current user');
      }
      
      // حذف کاربر
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        throw new Error(error.message);
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('UserManagementService.deleteUser error:', err);
      ErrorManager.logError(err, { 
        context: 'UserManagementService.deleteUser', 
        userId 
      });
      return { 
        success: false, 
        error: ErrorManager.getErrorMessage(err) 
      };
    }
  }
}

export const UserManagementService = new UserManagementServiceClass();
