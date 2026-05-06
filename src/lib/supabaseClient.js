import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// Suppress WebSocket connection errors from Lighthouse/Console
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("WebSocket connection to")) {
      return;
    }
    originalError.apply(console, args);
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
