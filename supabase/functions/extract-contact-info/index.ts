// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { pipeline, env } from 'https://esm.sh/@xenova/transformers@2.17.2';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

// Set environment variables for Transformers.js within Deno
env.allowLocalModels = false;
env.useWebWorkers = false; // Web Workers are not applicable in Deno Edge Functions
env.backends.onnx.wasm.numThreads = 1; // Limit threads for broader compatibility

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache the model globally in the Edge Function to avoid re-loading on every invocation
let extractor: any = null;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return new Response(JSON.stringify({ error: 'Authorization token is missing.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired token.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Load model if not already loaded
    if (!extractor) {
      console.log("Loading AI model in Edge Function...");
      extractor = await pipeline('token-classification', 'Xenova/distilbert-base-multilingual-cased-ner-hrl');
      console.log("AI model loaded in Edge Function.");
    }

    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required.' }), {
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
      notes: text, // Default notes to full text
    };

    // 1. Use NER for named entities (Person, Organization)
    const output = await extractor(text);

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

    // 3. Use Regex for Email Addresses
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    const emailAddresses: any[] = [];
    while ((match = emailRegex.exec(text)) !== null) {
      emailAddresses.push({ email_type: 'personal', email_address: match[0] });
    }
    extracted.emailAddresses = emailAddresses;

    // 4. Simple keyword extraction for position
    const positionKeywords = ['مدیر', 'مهندس', 'کارشناس', 'رئیس', 'معاون', 'مدیرعامل', 'برنامه‌نویس', 'توسعه‌دهنده', 'طراح'];
    for (const keyword of positionKeywords) {
      if (text.includes(keyword) && !extracted.position) {
        extracted.position = keyword;
        break;
      }
    }

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

    return new Response(JSON.stringify({ extractedInfo: extracted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Edge Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});