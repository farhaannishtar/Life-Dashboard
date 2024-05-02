import { NextApiRequest, NextApiResponse } from 'next';
import { notifyClients } from '../sse';
import { sumAndRoundQty } from 'helpers/helpers';

let latestMindfulMinutesData: number;

// Handler for the POST request
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // Only allow POST requests
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const data = req.body;

  latestMindfulMinutesData = sumAndRoundQty(data.data.metrics[0].data);
  notifyClients(latestMindfulMinutesData);

  // Respond with a success message
  res.status(200).json({ message: 'Data received and clients notified', data: latestMindfulMinutesData });
}

export { latestMindfulMinutesData };

// api URL path
// https://a5fa-2603-7000-3300-4340-d8b5-70c6-ff6d-87d4.ngrok-free.app/api/auto-export/mindful-minutes

