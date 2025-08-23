// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { pipeline } from 'https://esm.sh/@xenova/transformers@2.17.2';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

let extractor = null;

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

    if (!extractor) {
      console.log("Loading AI model in Edge Function...");
      extractor = await pipeline('token-classification', 'Xenova/distilbert-base-multilingual-cased-ner-hrl');
      console.log("AI model loaded in Edge Function.");
    }

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

    const extracted: any = {
      firstName: '',
      lastName: '',
      company: '',
      position: '',
      phoneNumbers: [],
      emailAddresses: [],
      socialLinks: [],
      notes: text,
    };

    // 1. Use NER for named entities (Person, Organization)
    const output = await extractor(text);
    console.log("NER output:", output);

    let currentFirstName = '';
    let currentLastName = '';
    let currentCompany = '';
    let currentPosition = '';

    const entities: { entity: string; word: string; start: number; end: number }[] = [];
    let currentEntity: { entity: string; word: string; start: number; end: number } | null = null;

    for (const item of output) {
      const entityType = item.entity.split('-')[1];
      const isBeginning = item.entity.startsWith('B-');

      if (isBeginning && currentEntity) {
        entities.push(currentEntity);
        currentEntity = null;
      }

      if (isBeginning || (currentEntity && item.entity.endsWith(currentEntity.entity.split('-')[1]))) {
        if (!currentEntity) {
          currentEntity = { entity: entityType, word: item.word.replace(/##/g, ''), start: item.start, end: item.end };
        } else {
          currentEntity.word += item.word.replace(/##/g, '');
          currentEntity.end = item.end;
        }
      } else if (currentEntity) {
        entities.push(currentEntity);
        currentEntity = null;
      }
    }
    if (currentEntity) {
      entities.push(currentEntity);
    }
    console.log("Processed entities:", entities);

    for (const entity of entities) {
      if (entity.entity === 'PER') {
        const nameParts = entity.word.split(' ').filter(Boolean);
        if (nameParts.length > 0) {
          if (!currentFirstName) {
            currentFirstName = nameParts[0];
            if (nameParts.length > 1) {
              currentLastName = nameParts.slice(1).join(' ');
            }
          } else if (!currentLastName) {
            currentLastName = nameParts.join(' ');
          }
        }
      } else if (entity.entity === 'ORG') {
        if (!currentCompany) {
          currentCompany = entity.word;
        }
      }
    }

    extracted.firstName = currentFirstName;
    extracted.lastName = currentLastName;
    extracted.company = currentCompany;

    // 2. Use Regex for Phone Numbers (Iranian mobile numbers)
    const phoneRegex = /(09\d{9})/g;
    let match;
    const phoneNumbers: any[] = [];
    while ((match = phoneRegex.exec(text)) !== null) {
      phoneNumbers.push({ phone_type: 'mobile', phone_number: match[0], extension: null });
    }
    extracted.phoneNumbers = phoneNumbers;
    console.log("Extracted phone numbers:", phoneNumbers);

    // 3. Use Regex for Email Addresses
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    const emailAddresses: any[] = [];
    while ((match = emailRegex.exec(text)) !== null) {
      emailAddresses.push({ email_type: 'personal', email_address: match[0] });
    }
    extracted.emailAddresses = emailAddresses;
    console.log("Extracted email addresses:", emailAddresses);

    // 4. Simple keyword extraction for position
    const positionKeywords = ['مدیر', 'مهندس', 'کارشناس', 'رئیس', 'معاون', 'مدیرعامل', 'برنامه‌نویس', 'توسعه‌دهنده', 'طراح'];
    for (const keyword of positionKeywords) {
      if (text.includes(keyword) && !extracted.position) {
        extracted.position = keyword;
        break;
      }
    }
    console.log("Extracted position:", extracted.position);

    // 5. Remove extracted info from notes
    let remainingNotes = text;
    [extracted.firstName, extracted.lastName, extracted.company, extracted.position]
      .filter(Boolean)
      .forEach(item => {
        remainingNotes = remainingNotes.replace(item, '').trim();
      });
    extracted.phoneNumbers.forEach((p: any) => {
      remainingNotes = remainingNotes.replace(p.phone_number, '').trim();
    });
    extracted.emailAddresses.forEach((e: any) => {
      remainingNotes = remainingNotes.replace(e.email_address, '').trim();
    });

    extracted.notes = remainingNotes.replace(/\s\s+/g, ' ').trim();
    console.log("Final extracted info:", extracted);

    return new Response(JSON.stringify({ extractedInfo: extracted }), {
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