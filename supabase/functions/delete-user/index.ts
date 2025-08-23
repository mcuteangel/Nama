// @ts-nocheck

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Log headers and content info for debugging
    console.log("Request Headers:", Object.fromEntries(req.headers.entries()));
    console.log("Content-Length:", contentLength);
    console.log("Content-Type:", contentType);

    // Validate content type and length before parsing JSON
    if (!contentType || !contentType.includes('application/json')) {
      console.error("Invalid Content-Type. Expected application/json.");
      return new Response(JSON.stringify({ error: 'Invalid Content-Type. Expected application/json.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    if (contentLength === '0') {
      console.error("Request body is empty.");
      return new Response(JSON.stringify({ error: 'Request body is empty. User ID is required.' }), {
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