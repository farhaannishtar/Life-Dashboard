import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const apiRes = await axios.get(
      "https://api.ouraring.com/v2/usercollection/personal_info",
      {
        headers: {
          Authorization: `Bearer X2EFIPGE4MDRQHLIZ5B4EYTRY3VZSBEK`, // replace with your bearer token
        },
      }
    );

    // Forward status code and data from Oura to client
    res.status(apiRes.status).json(apiRes.data);
  } catch (error) {
    // Assert error is of type AxiosError
    const axiosError = error as AxiosError;

    // Forward status code and error message from Oura to client
    res
      .status(axiosError.response?.status || 500)
      .json({ message: axiosError.message });
  }
}
