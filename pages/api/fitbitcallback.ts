// pages/api/fitbitcallback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Code is missing' });
  }

  try {
    // Exchange the code for tokens
    const response = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_API_URL}/api/fitbitcallback`,
        client_id: process.env.FITBIT_CLIENT_ID!,
      }).toString(),
    });
    
    const data = await response.json();
    console.log('data', data);

    // Handle the data, typically saving the tokens
    if (data.access_token && data.refresh_token) {
      // Update the tokens in the database
      const { error } = await supabase
        .from('fitbit_tokens')
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: new Date().getTime() + (data.expires_in * 1000)  // converting expires_in to milliseconds
        })
        .eq('id', 1);  // Assuming 'id' is known and fixed since it's a single-user setup

      if (error) throw error;
      console.log('Token exchange successful in callback route', data.access_token, data.refresh_token);
      res.redirect('/'); // Redirect after successful update
    } else {
      throw new Error('Token exchange failed');
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange token' });
  }
}
