import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Environment variables SUPABASE_URL or SUPABASE_SERVICE_KEY are not set."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
