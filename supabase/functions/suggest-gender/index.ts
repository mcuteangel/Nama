import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { GoogleGenerativeAI, GenerativeModel } from "npm:@google/generative-ai";

interface ContactName {
  id: string;
  firstName: string;
  lastName: string;
}

interface GenderSuggestion {
  contactId: string;
  suggestedGender: 'male' | 'female' | 'not_specified';
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

    const requestBody: { contacts: ContactName[] } = await req.json();
    const contactsToSuggest = requestBody.contacts;

    if (!contactsToSuggest || contactsToSuggest.length === 0) {
      return new Response(JSON.stringify({ error: 'No contacts provided for gender suggestion.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Fetch Gemini API key and model from user_settings table
    const { data: userSettings, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .select('gemini_api_key, gemini_model')
      .eq('user_id', user.id)
      .maybeSingle<UserSettings>();

    if (settingsError) {
      throw new Error(`Error fetching user settings: ${settingsError.message}`);
    }

    const geminiApiKey = userSettings?.gemini_api_key;
    const geminiModelName = userSettings?.gemini_model || 'gemini-pro';

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key is not set. Please set it in your profile settings.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model: GenerativeModel = genAI.getGenerativeModel({ model: geminiModelName });

    const namesForPrompt = contactsToSuggest.map(c => `${c.firstName} ${c.lastName}`).join(', ');

    const prompt = `
      Given the following list of Persian names, suggest the gender (male, female, or not_specified) for each.
      Return a JSON array of objects, where each object has 'id' (the original ID from the input) and 'suggestedGender'.
      If you cannot determine the gender, use 'not_specified'.
      The output should be ONLY the JSON array, no other text or markdown.

      Example Input:
      [
        {"id": "contact1_id", "name": "علی احمدی"},
        {"id": "contact2_id", "name": "فاطمه حسینی"},
        {"id": "contact3_id", "name": "سارا کریمی"}
      ]

      Example Output:
      [
        {"id": "contact1_id", "suggestedGender": "male"},
        {"id": "contact2_id", "suggestedGender": "female"},
        {"id": "contact3_id", "suggestedGender": "female"}
      ]

      Names to analyze:
      ${JSON.stringify(contactsToSuggest.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}` })))}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponseText = response.text();

    if (aiResponseText.startsWith('```json') && aiResponseText.endsWith('```')) {
      aiResponseText = aiResponseText.substring(7, aiResponseText.length - 3).trim();
    }

    const geminiSuggestions: Array<{ id: string; suggestedGender: 'male' | 'female' | 'not_specified' }> = JSON.parse(aiResponseText);

    // Map Gemini's response back to the expected format
    const finalSuggestions: GenderSuggestion[] = contactsToSuggest.map(contact => {
      const suggestion = geminiSuggestions.find(s => s.id === contact.id);
      return {
        contactId: contact.id,
        suggestedGender: suggestion?.suggestedGender || 'not_specified',
      };
    });

    return new Response(JSON.stringify({ suggestions: finalSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in suggest-gender function:", error.message, error.stack);
    return new Response(JSON.stringify({ error: `Function error: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});