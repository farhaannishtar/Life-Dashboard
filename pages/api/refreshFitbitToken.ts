import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Fetch current tokens and expires_at from Supabase
  const { data, error } = await supabase
    .from("fitbit_tokens")
    .select("*")
    .limit(1);

  // Log the returned data or error
  console.log("Data from Supabase: ", data);
  console.log("Error from Supabase: ", error);

  if (error) {
    return res.status(500).json({ error: "Error fetching data from Supabase" });
  }

  const { access_token, refresh_token, expires_at } = data[0];
  const currentTime = Math.floor(Date.now() / 1000);

  console.log("Current Time: ", currentTime);
  console.log("Expires At: ", expires_at);

  // Check if the token is expired
  if (currentTime >= expires_at) {
    // Logic to refresh the Fitbit token
    console.log("Token is expired. Refreshing...");
    // ...
    // Update the new tokens and expires_at in Supabase
    // ...
  }

  res.status(200).json({ message: "Token is still valid" });
}
