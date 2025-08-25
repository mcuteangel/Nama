// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return new Response(JSON.stringify({ error: 'Authorization token is missing.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired token.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Fetch Gemini API key and model from user_settings table
    const { data: userSettings, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .select('gemini_api_key, gemini_model')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) {
      return new Response(JSON.stringify({ error: `Error fetching user settings: ${settingsError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const geminiApiKey = userSettings?.gemini_api_key;
    const geminiModelName = userSettings?.gemini_model || 'gemini-pro'; // Default to gemini-pro

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key is not set. Please set it in your profile settings.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const requestBody = await req.json();
    const text = requestBody.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required for extraction.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: geminiModelName });

    const prompt = `
      Extract contact information from the following text.
      The output should be a JSON object with the following structure.
      If a field is not found, use an empty string or an empty array as appropriate.
      For phone numbers, try to identify the type (mobile, home, work, other) and extension if present.
      For email addresses, try to identify the type (personal, work, other).
      For social links, identify the type (linkedin, twitter, instagram, telegram, website, other) and the full URL.
      The output should be ONLY the JSON object, no other text or markdown.

      Example Input:
      "John Doe, Software Engineer at Example Corp. Mobile: +1-555-123-4567, Work Email: john.doe@example.com. LinkedIn: linkedin.com/in/johndoe"

      Example Output:
      {
        "firstName": "John",
        "lastName": "Doe",
        "company": "Example Corp",
        "position": "Software Engineer",
        "phoneNumbers": [{"phone_type": "mobile", "phone_number": "+1-555-123-4567", "extension": null}],
        "emailAddresses": [{"email_type": "work", "email_address": "john.doe@example.com"}],
        "socialLinks": [{"type": "linkedin", "url": "https://linkedin.com/in/johndoe"}],
        "notes": ""
      }

      Text to extract from:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Attempt to parse the JSON response
    let extractedInfo;
    try {
      extractedInfo = JSON.parse(rawText);
    } catch (jsonParseError) {
      console.error("Error parsing Gemini response as JSON:", jsonParseError);
      console.error("Raw Gemini response:", rawText);
      return new Response(JSON.stringify({ error: `Failed to parse AI response: ${jsonParseError.message}. Raw response: ${rawText.substring(0, 200)}...` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Basic validation of the extracted structure
    if (!extractedInfo || typeof extractedInfo !== 'object' || !('firstName' in extractedInfo)) {
      return new Response(JSON.stringify({ error: 'AI did not return expected contact information structure.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ extractedInfo }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in extract-contact-info function:", error.message, error.stack);
    return new Response(JSON.stringify({ error: `Function error: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});