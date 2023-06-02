// pages/api/updateHealthData.ts

import type { NextApiRequest, NextApiResponse } from "next";

interface HealthData {
  heartRate: number;
  steps: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const data: HealthData = req.body;

  // Here you can do whatever you need to do with the data
  // For example, store it in a database
  console.log("This is the data from the iOS application: ", data);

  // Send a response back to the client
  res.status(200).json({ message: "Health data received successfully." });
}
