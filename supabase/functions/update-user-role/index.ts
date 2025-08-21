/// <reference lib="deno.ns" />
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
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return new Response(JSON.stringify({ error: 'User ID and role are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Update the role in the profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      console.error("Profile update error:", profileError.message);
      return new Response(JSON.stringify({ error: profileError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 2. Update the user_metadata in auth.users to reflect the new role
    const { data: authUserUpdateData, error: authUserUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: { role: role } }
    );

    if (authUserUpdateError) {
      console.error("Auth user metadata update error:", authUserUpdateError.message);
      // Even if auth update fails, we return success if profile update was successful
      // as the primary role is in profiles table. User might need to re-login.
      return new Response(JSON.stringify({ message: 'User role updated in profiles, but failed to update auth metadata. User may need to re-login.', profile: profileData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 if profile update was successful
      });
    }

    return new Response(JSON.stringify({ message: 'User role updated successfully.', profile: profileData, authUser: authUserUpdateData.user }), {
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