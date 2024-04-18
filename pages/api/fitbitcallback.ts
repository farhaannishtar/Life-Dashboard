// pages/api/fitbitcallback.ts
import type { NextApiRequest, NextApiResponse } from 'next';

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
        'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID}:${process.env.NEXT_PUBLIC_FITBIT_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/fitbitcallback`,
        client_id: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID!,
      }).toString(),
    });
    
    const data = await response.json();
    console.log('data', data);

    // Handle the data, typically saving the tokens
    if (data.access_token) {
      // Save the tokens somewhere, like a database
      // Respond to the client
      res.redirect('/'); // Redirect or handle as needed
    } else {
      throw new Error('Token exchange failed');
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange token' });
  }
}
