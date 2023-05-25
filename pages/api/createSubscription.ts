import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Extract the required parameters from the request
    const { userId, collectionPath, subscriptionId } = req.query;

    // Perform any necessary validation or processing of the parameters

    // Send the POST request to the desired endpoint
    fetch(
      `/1/user/${userId}/${collectionPath}/apiSubscriptions/${subscriptionId}.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any other headers you need
        },
        body: JSON.stringify(req.body),
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("POST request failed");
        }
      })
      .then((data) => {
        // Handle the response data as needed
        res.status(200).json(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
