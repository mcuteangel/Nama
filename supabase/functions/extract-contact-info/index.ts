// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// import { pipeline } from 'https://esm.sh/@xenova/transformers@2.17.2'; // Temporarily commented out
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// let extractor = null; // Temporarily commented out

serve(async (req) => {
  console.log("Edge Function received request:", req.method, req.url);
  console.log("Request Headers:", Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request.");
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.error("Authorization token is missing.");
      return new Response(JSON.stringify({ error: 'Authorization token is missing.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error("Unauthorized:", authError?.message || "Invalid or expired token.");
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired token.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Temporarily skip AI model loading and extraction
    // if (!extractor) {
    //   console.log("Loading AI model in Edge Function...");
    //   extractor = await pipeline('token-classification', 'Xenova/distilbert-base-multilingual-cased-ner-hrl');
    //   console.log("AI model loaded in Edge Function.");
    // }

    let text: string;
    try {
      const requestBody = await req.json();
      text = requestBody.text;
      console.log("Parsed request body:", requestBody);
      console.log("Extracted text:", text);
    } catch (jsonError: any) {
      console.error("Error parsing request body as JSON:", jsonError.message);
      return new Response(JSON.stringify({ error: `Invalid JSON in request body: ${jsonError.message}. Ensure 'text' field is present.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.error("Text is missing or empty from the request body.");
      return new Response(JSON.stringify({ error: 'Text is required and cannot be empty.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Return a dummy response for now
    const dummyExtractedInfo = {
      firstName: 'DummyFirstName',
      lastName: 'DummyLastName',
      company: 'DummyCompany',
      position: 'DummyPosition',
      phoneNumbers: [{ phone_type: 'mobile', phone_number: '09123456789', extension: null }],
      emailAddresses: [{ email_type: 'personal', email_address: 'dummy@example.com' }],
      socialLinks: [],
      notes: `Original text: ${text}`,
    };

    return new Response(JSON.stringify({ extractedInfo: dummyExtractedInfo }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("General Edge Function error:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});