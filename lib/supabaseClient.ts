import { createClient } from "@supabase/supabase-js";
// test comment
let supabaseUrl: string | undefined;
let supabaseKey: string | undefined;

// Server-side context
if (typeof window === "undefined") {
  supabaseUrl = process.env.SUPABASE_URL;
  supabaseKey = process.env.SUPABASE_SERVICE_KEY;
}
// Client-side context
else {
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // If you have an anonymous key for public access
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Environment variables for Supabase are not set.");
}

export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");
