import { NextApiRequest, NextApiResponse } from "next";

type SubscriberParams = {
  endpointURL: string;
  format: "JSON";
  isDefault: boolean;
  id?: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { endpointURL, format, isDefault, id }: SubscriberParams = req.body;

    // Handle the POST request here
    console.log("Received POST request:", req.body);

    // Process the received parameters
    console.log("Endpoint URL:", endpointURL);
    console.log("Format:", format);
    console.log("Default:", isDefault);
    console.log("ID:", id);

    // You can perform any necessary actions based on the parameters

    res.status(200).end(); // Send a response indicating successful processing
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
