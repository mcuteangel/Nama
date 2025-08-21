/// <reference types="https://deno.land/std@0.190.0/http/server.d.ts" />
/// <reference types="https://esm.sh/@supabase/supabase-js@2.45.0/dist/main.d.ts" />

declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, first_name, last_name, role } = await req.json();

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: 'Email, password, and role are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create user in Supabase Auth, including the role in user_metadata
    const { data: userResponse, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm email
      user_metadata: { first_name, last_name, role }, // Now includes role in user_metadata
    });

    if (authError) {
      console.error("Auth error:", authError.message);
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const userId = userResponse.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID not found after creation.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Update profile with role and names (this is redundant for role if set in user_metadata, but good for consistency)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        first_name: first_name || null,
        last_name: last_name || null,
        role: role,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) {
      console.error("Profile update error:", profileError.message);
      // If profile update fails, attempt to delete the created auth user to prevent orphaned users
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: `Failed to set user role: ${profileError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'User created and role assigned successfully.', user: userResponse.user, profile: profileData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("General error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});