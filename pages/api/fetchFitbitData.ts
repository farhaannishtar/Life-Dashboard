import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { getCurrentDate } from "helpers/helpers";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Environment variables SUPABASE_URL or SUPABASE_SERVICE_KEY are not set."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Function invoked"); // Debugging log
  const { access_token, error: tokenError } = await refreshFitbitToken();
  if (tokenError) {
    return res
      .status(500)
      .json({ error: `Failed to refresh Fitbit token: ${tokenError}` });
  }

  try {
    const fitbitData = await fetchFitbitData(access_token);
    return res.status(200).json({ data: fitbitData });
  } catch (error) {
    console.error(`Error fetching Fitbit data: ${error}`);
    return res
      .status(500)
      .json({ error: `Failed to fetch Fitbit data: ${error}` });
  }
}

// Function to refresh Fitbit token
async function refreshFitbitToken() {
  const { data, error } = await supabase
    .from("fitbit_tokens")
    .select("*")
    .limit(1);

  console.log("Supabase data:", data);

  if (error) {
    console.error("Error fetching data from Supabase:", error);
    return { error };
  }

  const { access_token, refresh_token, expires_at } = data![0];
  const currentTime = Math.floor(Date.now() / 1000);
  console.log("Current time:", currentTime);
  console.log("expires_at:", expires_at);
  // if (currentTime >= expires_at - 60) {
  // Added 60 seconds buffer
  const encodedCredentials = Buffer.from(
    `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const fitbitResponse = await axios.post(
      "https://api.fitbit.com/oauth2/token",
      `grant_type=refresh_token&refresh_token=${refresh_token}`,
      {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Fitbit response:", fitbitResponse.data);

    const newAccessToken = fitbitResponse.data.access_token;
    const newRefreshToken = fitbitResponse.data.refresh_token; // New refresh token
    const newExpiresIn = fitbitResponse.data.expires_in;
    const newExpiresAt = Math.floor(Date.now() / 1000) + newExpiresIn;

    // Update both the new access token and the new refresh token in the database
    const { error: updateError, data: updateData } = await supabase
      .from("fitbit_tokens")
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken, // Include the new refresh token
        expires_at: newExpiresAt,
      })
      .eq("id", data[0].id);

    console.log("Supabase update result:", updateData);

    if (updateError) {
      console.error("Failed to update tokens:", updateError);
      return { error: updateError };
    }

    return { access_token: newAccessToken };
  } catch (err: any) {
    // Explicitly annotate err as any
    if (err && err.response && err.response.data) {
      console.error("Error refreshing Fitbit token:", err.response.data);
    } else {
      console.error("Error refreshing Fitbit token:", err);
    }
    return { error: err };
  }
}

// Function to fetch Fitbit data using a valid access token
async function fetchFitbitData(access_token: string) {
  let date = getCurrentDate();
  const fitbitApiUrl = `https://api.fitbit.com/1/user/-/body/weight/date/2023-02-23/${date}.json`;
  const response = await axios.get(fitbitApiUrl, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return response.data;
}
