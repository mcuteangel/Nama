import { supabase } from '@/integrations/supabase/client';

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

interface EdgeFunctionTestResult {
  success: boolean;
  details: {
    error?: string;
    message?: string;
    usersCount?: number;
    sessionValid?: boolean;
    userRole?: string;
    supabaseError?: SupabaseError;
    errorMessage?: string;
    errorStack?: string;
  };
}

interface DirectFetchTestResult {
  success: boolean;
  details: {
    error?: string;
    status?: number;
    statusText?: string;
    data?: unknown;
    headers?: Record<string, string>;
    errorMessage?: string;
  };
}

export const EdgeFunctionDebugger = {
  async testConnection(): Promise<EdgeFunctionTestResult> {
    console.log('🔍 Starting Edge Function connection test...');
    
    try {
      // 1. Check environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('📋 Environment check:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlFormat: supabaseUrl?.includes('supabase.co') ? 'Valid' : 'Invalid'
      });
      
      if (!supabaseUrl || !supabaseKey) {
        return {
          success: false,
          details: { error: 'Missing environment variables' }
        };
      }
      
      // 2. Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Session check:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
        sessionError: sessionError?.message
      });
      
      if (!session) {
        return {
          success: false,
          details: { error: 'No active session' }
        };
      }
      
      // 3. Test simple Edge Function call
      console.log('🌐 Testing Edge Function call...');
      const { data, error } = await supabase.functions.invoke('get-all-users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      console.log('📡 Edge Function response:', { data, error });
      
      if (error) {
        return {
          success: false,
          details: { 
            error: 'Edge Function call failed',
            supabaseError: error,
            sessionValid: !!session,
            userRole: session.user?.user_metadata?.role
          }
        };
      }
      
      return {
        success: true,
        details: {
          message: 'Edge Function connection successful',
          usersCount: data?.users?.length || 0,
          sessionValid: true,
          userRole: session.user?.user_metadata?.role
        }
      };
      
    } catch (err: unknown) {
      const error = err as Error;
      console.error('❌ Connection test failed:', err);
      return {
        success: false,
        details: {
          error: 'Connection test failed',
          errorMessage: error.message,
          errorStack: error.stack
        }
      };
    }
  },
  
  async testDirectFetch(): Promise<DirectFetchTestResult> {
    console.log('🔄 Testing direct fetch to Edge Function...');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, details: { error: 'No session for direct fetch' } };
      }
      
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-all-users`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({}),
      });
      
      const responseData = await response.json();
      
      console.log('🌐 Direct fetch response:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      });
      
      return {
        success: response.ok,
        details: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        }
      };
      
    } catch (err: unknown) {
      const error = err as Error;
      console.error('❌ Direct fetch failed:', err);
      return {
        success: false,
        details: {
          error: 'Direct fetch failed',
          errorMessage: error.message
        }
      };
    }
  }
};

// Export for console usage
if (typeof window !== 'undefined') {
  (window as unknown as Window & { EdgeFunctionDebugger: typeof EdgeFunctionDebugger }).EdgeFunctionDebugger = EdgeFunctionDebugger;
}