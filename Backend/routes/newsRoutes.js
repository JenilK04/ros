import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Fetch housing market & real estate news with nextPage token
router.get("/realestate", async (req, res) => {
  try {
    const nextPage = req.query.page || null; // token for next page

    const { data } = await axios.get("https://newsdata.io/api/1/latest", {
      params: {
        apikey: process.env.NEWSDATA_API_KEY,
        q: "real estate,housing market",
        language: "en",
        country: "in",
        page: nextPage
      }
    });

    // Filter out articles missing title or link
    const filteredArticles = (data.results || []).filter(
      (article) => article.title && article.link
    );

    // Return articles + nextPage token
    res.json({
      articles: filteredArticles,
      nextPage: data.nextPage || null
    });
  } catch (err) {
    console.error("Error fetching news:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch real estate news" });
  }
});

export default router;
