import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { verify } = req.query;
  if (
    verify ===
    "a1b59967cbcb7f0c19a0451370bed89a29142a75c6e46d833486b7f7a2bf3b71"
  ) {
    res.status(204).end();
  } else {
    res.status(404).end();
  }
}
