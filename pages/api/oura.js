import express from "express";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get("/api/oura", async (req, res) => {
  const token = "7FADD6MJ4TRXKFR33QOFYKGXH5P53T3J";
  const { startDate, endDate } = req.query;
  const url = `https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}&access_token=${token}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
