import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";

async function fetchSleepTime(token: string) {
  const myHeaders = {
    Authorization: `Bearer ${token}`,
  };
  try {
    const response = await axios.get(
      "https://api.ouraring.com/v2/usercollection/sleep_time?start_date=2023-09-11&end_date=2023-09-19",
      { headers: myHeaders }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching sleep time data", error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = "X2EFIPGE4MDRQHLIZ5B4EYTRY3VZSBEK"; // Assuming you have the API token stored in .env.local
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sleepTimeData = await fetchSleepTime(token);
    res.status(200).json(sleepTimeData);
  } catch (error) {
    console.error("Handler error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
