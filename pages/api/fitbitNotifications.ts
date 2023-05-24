import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Handle the POST request here
    console.log("Received POST request:", req.body);

    // You can process the received data and perform any necessary actions

    res.status(200).end(); // Send a response indicating successful processing
  } else {
    // Handle other HTTP methods if necessary
    res.status(405).end(); // Method Not Allowed
  }
}
