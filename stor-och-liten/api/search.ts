import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q, start } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Missing or invalid search query parameter (q)" });
  }

  const startNum = typeof start === "string" && /^\d+$/.test(start) ? parseInt(start, 10) : 1;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          q,
          key: process.env.VITE_GOOGLE_API_KEY,
          cx: process.env.VITE_SEARCH_ENGINE_ID,
          siteSearch: "storochliten.se/",
          start: startNum,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return res
        .status(error.response?.status || 500)
        .json(error.response?.data || { error: "API error" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
