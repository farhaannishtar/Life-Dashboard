import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    const apiRes = await axios.get(
      `https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: `Bearer X2EFIPGE4MDRQHLIZ5B4EYTRY3VZSBEK`, // replace with your bearer token
        },
      }
    );

    // Forward status code and data from Oura to client
    res.status(apiRes.status).json(apiRes.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response?.status || 500)
        .json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}
