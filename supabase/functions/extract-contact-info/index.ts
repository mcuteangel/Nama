// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'; // Temporarily commented out

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  console.log("Edge Function received request (simplified):", req.method, req.url);
  console.log("Request Headers (simplified):", Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request (simplified).");
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Simulate some processing
    const requestBody = await req.json();
    const text = requestBody.text;
    console.log("Received text (simplified):", text);

    const extractedInfo = {
      firstName: "Test",
      lastName: "User",
      company: "TestCo",
      position: "Tester",
      phoneNumbers: [{ phone_type: "mobile", phone_number: "1234567890", extension: null }],
      emailAddresses: [{ email_type: "personal", email_address: "test@example.com" }],
      socialLinks: [],
      notes: `Simplified extraction for: ${text}`,
    };

    console.log("Returning simplified response.");
    return new Response(JSON.stringify({ extractedInfo }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Simplified Edge Function error:", error.message, error.stack);
    return new Response(JSON.stringify({ error: `Simplified function error: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});