import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "utils/supabaseClient";
import { getCurrentDate, getLastWeeksDate } from "helpers/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const accessToken = await refreshFitbitTokenIfNeeded();
    const fitbitData = await fetchFitbitData(accessToken);
    res.status(200).json(fitbitData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

async function fetchFitbitData(accessToken: string) {
  let date = getCurrentDate();
  let twoWeeksAgo = getLastWeeksDate();
  console.log('date', date, 'twoWeeksAgo', twoWeeksAgo);
  const response = await fetch(`https://api.fitbit.com/1/user/-/body/log/weight/date/${twoWeeksAgo}/${date}.json`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch Fitbit data.');
  return response.json();
}

async function refreshFitbitTokenIfNeeded() {
  const { data, error } = await supabase
    .from('fitbit_tokens')
    .select('*')
    .single();

  if (error) throw new Error('Failed to fetch token.');

  const now = new Date().getTime();
  if (data.expires_at < now) {
    // Assume a function `refreshToken` that handles the API call to refresh the token
    // const refreshedData = await refreshToken(data.refresh_token);
    await supabase
      .from('fitbit_tokens')
      .update({
        // access_token: refreshedData.access_token,
        // refresh_token: refreshedData.refresh_token,
        // expires_at: new Date().getTime() + (refreshedData.expires_in * 1000)
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date().getTime() + (data.expires_in * 1000)
      })
      .eq('id', data.id);

    // return refreshedData.access_token;
    return data.access_token;
  }
  return data.access_token;
}

