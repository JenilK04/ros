import React, { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "./navbar";

const RealEstateNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(null); // token for next page

  // Fetch news
  const fetchNews = async (pageToken = null) => {
    try {
      setLoading(true);
      const response = await API.get("/news/realestate", {
        params: { page: pageToken }
      });

      setNews((prev) => [...prev, ...response.data.articles]);
      setNextPage(response.data.nextPage); // store nextPage token
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch first page on mount
  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-5 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Real Estate & Housing Market News
        </h2>

        {news.length === 0 && loading ? (
          <p className="text-sm text-gray-500">Loading news...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((article, idx) => (
              <a
                key={idx}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-24 h-24 object-cover"
                  />
                )}
                <div className="p-3 flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {article.pubDate
                      ? new Date(article.pubDate).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {nextPage && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => fetchNews(nextPage)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {!nextPage && news.length > 0 && (
          <p className="text-center text-sm text-gray-500 mt-2">
            No more articles
          </p>
        )}
      </div>
    </>
  );
};

export default RealEstateNews;
