// This file provides ambient module declarations for TypeScript to resolve Deno and npm imports
// used in Supabase Edge Functions, preventing compile-time errors in the main project.

declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export { serve } from "https://deno.land/std@0.190.0/http/server.ts";
}

declare module "https://esm.sh/@supabase/supabase-js@2.55.0" {
  export { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
}

declare module "npm:@google/generative-ai" {
  export { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
}

// Declare Deno global namespace
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}