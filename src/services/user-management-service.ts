import { supabase } from '@/integrations/supabase/client';
import { ErrorManager } from '@/lib/error-manager';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

interface CreateUserInput {
  email: string;
  password?: string; // Password is optional for admin.createUser, but required for sign up
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin';
}

interface UpdateUserRoleInput {
  userId: string;
  role: 'user' | 'admin';
}

export const UserManagementService = {
  async getAllUsers(): Promise<{ data: UserProfile[] | null; error: string | null }> {
    try {
      // Call the new Edge Function to get all users with their profiles
      const { data, error } = await supabase.functions.invoke('get-all-users');

      if (error) {
        throw new Error(error.message);
      }

      // The Edge Function returns { users: UserProfile[] }
      return { data: data.users as UserProfile[], error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'UserManagementService.getAllUsers' });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async createUser(input: CreateUserInput): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const { email, password, first_name, last_name, role } = input;

      // Invoke Edge Function to create user with service role key
      const { data, error } = await supabase.functions.invoke('create-user-with-role', {
        body: JSON.stringify({ email, password, first_name, last_name, role }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        throw new Error(error.message);
      }

      // The Edge Function returns user and profile data
      const newUser: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        first_name: data.profile.first_name,
        last_name: data.profile.last_name,
        role: data.profile.role,
        created_at: data.profile.created_at,
      };

      return { data: newUser, error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'UserManagementService.createUser', input });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async updateUserRole(input: UpdateUserRoleInput): Promise<{ success: boolean; error: string | null }> {
    try {
      const { userId, role } = input;

      // Invoke Edge Function to update user role with service role key
      const { data, error } = await supabase.functions.invoke('update-user-role', {
        body: JSON.stringify({ userId, role }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'UserManagementService.updateUserRole', input });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Invoke Edge Function to delete user with service role key
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: JSON.stringify({ userId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, error: null };
    } catch (err: any) {
      ErrorManager.logError(err, { context: 'UserManagementService.deleteUser', userId });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },
};