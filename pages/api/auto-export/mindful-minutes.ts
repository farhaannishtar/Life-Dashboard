import { NextApiRequest, NextApiResponse } from 'next';

let latestMindfulMinutesData: number;

// Handler for the POST request
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // Only allow POST requests
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const data = req.body;

  // Handle the mindful minutes data (e.g., log it for now)
  console.log(`Received mindful minutes`);

  latestMindfulMinutesData = data.data.metrics[0].data[0].qty;
  console.log(latestMindfulMinutesData);
  

  // Respond with a success message
  res.status(200).json({ message: 'Mindful minutes received successfully' });
}

export { latestMindfulMinutesData };

// api URL path
// https://a5fa-2603-7000-3300-4340-d8b5-70c6-ff6d-87d4.ngrok-free.app/api/auto-export/mindful-minutes

