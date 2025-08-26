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

interface UpdateUserProfileInput {
  userId: string;
  first_name: string | null;
  last_name: string | null;
}

interface UpdateUserPasswordInput {
  userId: string;
  newPassword: string;
}

export const UserManagementService = {
  async getAllUsers(): Promise<{ data: UserProfile[] | null; error: string | null }> {
    try {
      console.log('UserManagementService: Calling get-all-users Edge Function...');
      
      // Check if we have a valid session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        throw new Error('No active session found. User must be logged in.');
      }
      
      console.log('Session found, user:', session.user?.email);
      
      // Call the new Edge Function to get all users with their profiles
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
      // The Edge Function returns { users: UserProfile[] }
      return { data: data.users as UserProfile[], error: null };
    } catch (err: unknown) {
      console.error('UserManagementService.getAllUsers error:', err);
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
    } catch (err: unknown) {
      ErrorManager.logError(err, { context: 'UserManagementService.createUser', input });
      return { data: null, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async updateUserRole(input: UpdateUserRoleInput): Promise<{ success: boolean; error: string | null }> {
    try {
      const { userId, role } = input;

      // Invoke Edge Function to update user role with service role key
      const { error } = await supabase.functions.invoke('update-user-role', {
        body: JSON.stringify({ userId, role }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      ErrorManager.logError(err, { context: 'UserManagementService.updateUserRole', input });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async updateUserProfile(input: UpdateUserProfileInput): Promise<{ success: boolean; error: string | null }> {
    try {
      const { userId, first_name, last_name } = input;

      // Invoke Edge Function to update user profile with service role key
      const { error } = await supabase.functions.invoke('update-user-profile', {
        body: JSON.stringify({ userId, first_name, last_name }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      ErrorManager.logError(err, { context: 'UserManagementService.updateUserProfile', input });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async updateUserPassword(input: UpdateUserPasswordInput): Promise<{ success: boolean; error: string | null }> {
    try {
      const { userId, newPassword } = input;

      // Invoke Edge Function to update user password with service role key
      const { error } = await supabase.functions.invoke('update-user-password', {
        body: JSON.stringify({ userId, newPassword }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      ErrorManager.logError(err, { context: 'UserManagementService.updateUserPassword', input });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },

  async deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const requestBody = { userId };
      console.log("UserManagementService: Deleting user with body:", requestBody);

      // Get the JWT token from the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("No active session found. User must be logged in to delete users.");
      }

      const response = await fetch(
        `https://hhtaykuurboewbowzesa.supabase.co/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`, // Use the access token for authorization
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, // Use the public anon key from environment variables
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      ErrorManager.logError(err, { context: 'UserManagementService.deleteUser', userId });
      return { success: false, error: ErrorManager.getErrorMessage(err) };
    }
  },
};