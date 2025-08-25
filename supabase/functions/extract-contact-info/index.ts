// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  console.log("Edge Function received request:", req.method, req.url);
  console.log("Request Headers:", Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request.");
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Use the service role key for admin access to fetch user settings
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    // Authenticate the user with the provided token using the anon key client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error("Unauthorized:", authError?.message || "Invalid or expired token.");
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired token.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Fetch Gemini API key AND model from user_settings table using supabaseAdmin
    const { data: userSettings, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .select('gemini_api_key, gemini_model') // Select both fields
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) {
      console.error("Error fetching user settings:", settingsError.message);
      return new Response(JSON.stringify({ error: `Error fetching user settings: ${settingsError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const geminiApiKey = userSettings?.gemini_api_key;
    const geminiModel = userSettings?.gemini_model || 'gemini-pro'; // Default to 'gemini-pro' if not set

    if (!geminiApiKey) {
      console.error("Gemini API key not found for user:", user.id);
      return new Response(JSON.stringify({ error: 'Gemini API key is not set. Please set it in your profile settings.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    let text: string;
    try {
      const requestBody = await req.json();
      text = requestBody.text;
      console.log("Parsed request body:", requestBody);
      console.log("Text for extraction:", text);
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

    const prompt = `Extract contact information (first name, last name, company, position, phone numbers, email addresses, social media links, and any other relevant notes) from the following text. Provide the output in a JSON format with keys: firstName, lastName, company, position, phoneNumbers (array of {phone_type: string, phone_number: string, extension: string | null}), emailAddresses (array of {email_type: string, email_address: string}), socialLinks (array of {type: string, url: string}), notes: string. If a field is not found, use an empty string or empty array. For phone_type and email_type, use 'mobile', 'home', 'work', 'personal', 'other'. For social link type, use 'linkedin', 'twitter', 'instagram', 'telegram', 'website', 'other'. Ensure the output is a valid JSON string only, without any markdown or extra text.

Text: ${text}`;

    console.log("Calling Gemini API with model:", geminiModel);
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    console.log("Received response from Gemini API. Status:", geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json();
      console.error("Gemini API error:", geminiResponse.status, errorBody);
      throw new Error(`Gemini API error: ${errorBody.error?.message || 'Unknown error'}`);
    }

    const geminiData = await geminiResponse.json();
    console.log("Raw Gemini response data:", JSON.stringify(geminiData, null, 2));

    let extractedInfo: any = {
      firstName: '',
      lastName: '',
      company: '',
      position: '',
      phoneNumbers: [],
      emailAddresses: [],
      socialLinks: [],
      notes: text,
    };

    try {
      const geminiOutputText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("Gemini output text:", geminiOutputText);

      if (!geminiOutputText) {
        console.warn("Gemini did not return valid content. Falling back to basic extraction.");
        throw new Error("Gemini did not return valid content."); // Force fallback
      }

      let jsonString = geminiOutputText.trim();
      console.log("Cleaned Gemini JSON string before parsing:", jsonString);

      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7, jsonString.lastIndexOf('```')).trim();
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.substring(3, jsonString.lastIndexOf('```')).trim();
      }
      
      const parsedGeminiOutput = JSON.parse(jsonString);
      console.log("Parsed Gemini output object:", parsedGeminiOutput);

      extractedInfo = {
        firstName: parsedGeminiOutput.firstName || '',
        lastName: parsedGeminiOutput.lastName || '',
        company: parsedGeminiOutput.company || '',
        position: parsedGeminiOutput.position || '',
        phoneNumbers: Array.isArray(parsedGeminiOutput.phoneNumbers) ? parsedGeminiOutput.phoneNumbers : [],
        emailAddresses: Array.isArray(parsedGeminiOutput.emailAddresses) ? parsedGeminiOutput.emailAddresses : [],
        socialLinks: Array.isArray(parsedGeminiOutput.socialLinks) ? parsedGeminiOutput.socialLinks : [],
        notes: parsedGeminiOutput.notes || text,
      };

    } catch (parseError: any) {
      console.error("Error parsing Gemini's JSON output or invalid content:", parseError.message);
      console.warn("Falling back to basic regex extraction.");
      // Fallback to a simpler extraction if Gemini's JSON is malformed
      extractedInfo.notes = `Could not parse AI response. Original text: ${text}`;
      
      const phoneRegex = /(09\d{9})/g;
      let match;
      const phoneNumbers: any[] = [];
      while ((match = phoneRegex.exec(text)) !== null) {
        phoneNumbers.push({ phone_type: 'mobile', phone_number: match[0], extension: null });
      }
      extractedInfo.phoneNumbers = phoneNumbers;

      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
      const emailAddresses: any[] = [];
      while ((match = emailRegex.exec(text)) !== null) {
        emailAddresses.push({ email_type: 'personal', email_address: match[0] });
      }
      extractedInfo.emailAddresses = emailAddresses;

      // Ensure socialLinks is an array even in fallback
      if (!Array.isArray(extractedInfo.socialLinks)) {
        extractedInfo.socialLinks = [];
      }
    }

    console.log("Final extractedInfo before sending to client:", JSON.stringify(extractedInfo, null, 2));
    return new Response(JSON.stringify({ extractedInfo }), {
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