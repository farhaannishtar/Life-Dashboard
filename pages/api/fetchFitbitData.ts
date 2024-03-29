import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "utils/supabaseClient";
import axios from "axios";
import { getCurrentDate, getLastWeeksDate } from "helpers/helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  if (error) {
    console.error("Error fetching data from Supabase:", error);
    return { error };
  }

  const { access_token, refresh_token, expires_at } = data![0];
  
  console.log("access_token", access_token);

  const currentTime = Math.floor(Date.now() / 1000);

  if (currentTime >= expires_at - 60) {
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

      const newAccessToken = fitbitResponse.data.access_token;
      const newRefreshToken = fitbitResponse.data.refresh_token;
      const newExpiresIn = fitbitResponse.data.expires_in;
      const newExpiresAt = Math.floor(Date.now() / 1000) + newExpiresIn;

      const { error: updateError, data: updateData } = await supabase
        .from("fitbit_tokens")
        .update({
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_at: newExpiresAt,
        })
        .eq("id", data[0].id);

      if (updateError) {
        console.error("Failed to update tokens:", updateError);
        return { error: updateError };
      }

      return { access_token: newAccessToken };
    } catch (err: any) {
      if (err && err.response && err.response.data) {
        console.error("Error refreshing Fitbit token:", err.response.data);
      } else {
        console.error("Error refreshing Fitbit token:", err);
      }
      return { error: err };
    }
  } else {
    // If the token is not about to expire, return the current access token
    return { access_token };
  }
}

// Function to fetch Fitbit data using a valid access token
async function fetchFitbitData(access_token: string) {
  let date = getCurrentDate();
  let twoWeeksAgo = getLastWeeksDate();
  console.log("date", date);
  console.log("twoWeeksAgo", twoWeeksAgo);
  const fitbitApiUrl = `https://api.fitbit.com/1/user/-/body/log/weight/date/${twoWeeksAgo}/${date}.json`;
  const response = await axios.get(fitbitApiUrl, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return response.data;
}
