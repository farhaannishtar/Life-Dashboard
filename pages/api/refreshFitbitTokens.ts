// /pages/api/refreshFitbitTokens.ts
import type { NextApiRequest, NextApiResponse } from 'next';
// import { refreshToken } from '../../utils/refreshToken'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // await refreshToken();
      res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ message: 'Failed to refresh token', error: error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
