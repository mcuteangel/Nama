// @ts-nocheck
/// <reference lib="deno.ns" />
/// <reference types="https://deno.land/std@0.190.0/http/server.d.ts" />
/// <reference types="https://esm.sh/@supabase/supabase-js@2.55.0/dist/main.d.ts" />

declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Edge Function delete-user received request."); // Added log at the very beginning

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

    console.log("Request Headers:", Object.fromEntries(req.headers.entries()));
    console.log("Content-Length before JSON parse:", contentLength); // Added log
    console.log("Content-Type before JSON parse:", contentType); // Added log

    // Validate content type
    if (!contentType || !contentType.includes('application/json')) {
      console.error("Invalid Content-Type. Expected application/json.");
      return new Response(JSON.stringify({ error: 'Invalid Content-Type. Expected application/json.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    // Removed contentLength === '0' check, let req.json() handle it.

    let requestBody;
    try {
      requestBody = await req.json();
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
      console.error("User ID is missing from the request body after parsing.");
      return new Response(JSON.stringify({ error: 'User ID is required in the request body.' }), {
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