import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { GoogleGenerativeAI, GenerativeModel } from "npm:@google/generative-ai";

// Define types for better type safety
interface ExtractedContactInfo {
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phoneNumbers: Array<{ phone_type: string; phone_number: string; extension: string | null }>;
  emailAddresses: Array<{ email_type: string; email_address: string }>;
  socialLinks: Array<{ type: string; url: string }>;
  notes: string;
}

interface UserSettings {
  gemini_api_key: string | null;
  gemini_model: string | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseAdmin: SupabaseClient = createClient(
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

    const supabaseClient: SupabaseClient = createClient(
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
      .maybeSingle<UserSettings>(); // Explicitly type the result

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

    const requestBody: { text: string } = await req.json();
    const text = requestBody.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required for extraction.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model: GenerativeModel = genAI.getGenerativeModel({ model: geminiModelName });

    const prompt = `
      Extract contact information from the following text, which is in Persian (Farsi).
      The output should be a JSON object with the specified structure.
      The JSON keys (e.g., "firstName", "lastName", "company", "phoneNumbers", "emailAddresses", "socialLinks", "notes") must be in English.
      The *values* for "firstName", "lastName", "company", "position", and "notes" should be extracted directly from the Persian input text.
      For "phone_type", "email_type", and "socialLinks.type", map the Persian descriptions to their corresponding English enum values.
      For example:
      - 'موبایل' should map to 'mobile'
      - 'منزل' should map to 'home'
      - 'کار' should map to 'work'
      - 'شخصی' should map to 'personal'
      - 'لینکدین' should map to 'linkedin'
      - 'وب‌سایت' should map to 'website'
      If a field is not found, use an empty string or an empty array as appropriate.
      The output should be ONLY the JSON object, no other text or markdown.

      Example Input (Persian):
      "علی احمدی، مهندس نرم‌افزار در شرکت فناوری نوین. موبایل: 09123456789، ایمیل کاری: ali.ahmadi@novintech.com. لینکدین: linkedin.com/in/aliahmadi"

      Example Output:
      {
        "firstName": "علی",
        "lastName": "احمدی",
        "company": "شرکت فناوری نوین",
        "position": "مهندس نرم‌افزار",
        "phoneNumbers": [{"phone_type": "mobile", "phone_number": "09123456789", "extension": null}],
        "emailAddresses": [{"email_type": "work", "email_address": "ali.ahmadi@novintech.com"}],
        "socialLinks": [{"type": "linkedin", "url": "https://linkedin.com/in/aliahmadi"}],
        "notes": ""
      }

      Text to extract from:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text();

    // Strip markdown code block if present
    if (rawText.startsWith('```json') && rawText.endsWith('```')) {
      rawText = rawText.substring(7, rawText.length - 3).trim();
    }

    // Attempt to parse the JSON response
    let extractedInfo: ExtractedContactInfo;
    try {
      extractedInfo = JSON.parse(rawText);
    } catch (jsonParseError: any) {
      console.error("Error parsing Gemini response as JSON:", jsonParseError);
      console.error("Raw Gemini response (after stripping):", rawText);
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