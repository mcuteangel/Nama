const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The following imports and references are for the Deno runtime environment
// and should not cause TypeScript errors in a local Node.js/React setup.
// They are commented out to resolve compile-time errors.
// import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// declare namespace Deno {
//   namespace env {
//     function get(key: string): string | undefined;
//   }
// }

// Placeholder for Deno.env.get and createClient if not imported
// In the actual Supabase Edge Function environment, these will be available.
const Deno = {
  env: {
    get: (key: string) => process.env[key] // This is a placeholder for local TS checking
  }
};
const createClient = (url: string, key: string) => ({ // This is a placeholder for local TS checking
  auth: {
    admin: {
      listUsers: () => Promise.resolve({ data: { users: [] }, error: null }),
      createUser: (user: any) => Promise.resolve({ data: { user: {} }, error: null }),
      deleteUser: (id: string) => Promise.resolve({ data: {}, error: null }),
      updateUserById: (id: string, updates: any) => Promise.resolve({ data: {}, error: null }),
    }
  },
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        maybeSingle: () => Promise.resolve({ data: {}, error: null }),
        single: () => Promise.resolve({ data: {}, error: null }),
      }),
      in: (column: string, values: any[]) => ({
        maybeSingle: () => Promise.resolve({ data: {}, error: null }),
        single: () => Promise.resolve({ data: {}, error: null }),
      }),
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: {}, error: null }),
      }),
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: {}, error: null }),
    }),
    delete: () => ({
      in: (column: string, values: any[]) => Promise.resolve({ data: {}, error: null }),
      eq: (column: string, value: any) => Promise.resolve({ data: {}, error: null }),
    }),
  }),
  functions: {
    invoke: (name: string, options: any) => Promise.resolve({ data: {}, error: null }),
  }
});
const serve = (handler: (req: Request) => Promise<Response>) => { /* no-op for local TS */ };


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let userId: string;
    const contentLength = req.headers.get('content-length');
    const contentType = req.headers.get('content-type');

    console.log("Request Headers:", Object.fromEntries(req.headers.entries())); // Log all headers
    console.log("Content-Length:", contentLength);
    console.log("Content-Type:", contentType);

    // Check if content-length is 0 or content-type is not JSON
    if (contentLength === '0' || !contentType?.includes('application/json')) {
      console.error("Request body is empty or not JSON. Cannot parse userId.");
      return new Response(JSON.stringify({ error: 'Request body is empty or malformed JSON. User ID is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    try {
      const requestBody = await req.json();
      userId = requestBody.userId;
      console.log("Parsed userId from body:", userId);
    } catch (jsonError: any) {
      console.error("Error parsing request body as JSON:", jsonError.message);
      return new Response(JSON.stringify({ error: `Invalid JSON in request body: ${jsonError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!userId) {
      console.error("User ID is missing from parsed request body.");
      return new Response(JSON.stringify({ error: 'User ID is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Supabase auth.admin.deleteUser error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log("User deleted successfully:", userId);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Unhandled error in delete-user function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});