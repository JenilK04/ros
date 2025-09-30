import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";

const ARViewer = ({ propertyId }) => {
  const [arModelLink, setArModelLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [propertyFetched, setPropertyFetched] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const intervalRef = useRef(null);

  // Fetch property info initially
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/properties/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.arModel?.length) setArModelLink(res.data.arModel[0]);
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setPropertyFetched(true);
      }
    };
    fetchProperty();
    return () => clearInterval(intervalRef.current);
  }, [propertyId]);

  // Poll AR generation progress
  const pollARGeneration = () => {
    const token = localStorage.getItem("token");
    intervalRef.current = setInterval(async () => {
      try {
        const res = await API.get(`/properties/${propertyId}/ar-progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { progress: prog, status: stat } = res.data;
        setProgress(prog);
        setStatus(stat);

        if (stat === "success") {
          clearInterval(intervalRef.current);
          fetchLatestLink();
          setLoading(false);
        } else if (stat === "failed") {
          clearInterval(intervalRef.current);
          setLoading(false);
          alert("❌ AR generation failed!");
        }
      } catch (err) {
        console.error("Error polling AR progress:", err);
        clearInterval(intervalRef.current);
        setLoading(false);
      }
    }, 2000);
  };

  // Start AR generation
  const generateAR = async () => {
    setLoading(true);
    setStatus("starting");
    setProgress(0);
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/properties/${propertyId}/generate-ar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus("running");
      pollARGeneration();
    } catch (err) {
      console.error("Failed to start AR generation:", err);
      setLoading(false);
      alert("⚠️ Error generating AR model. Try again later.");
    }
  };

  // Fetch latest AR download link (refresh every time popup opens)
  const fetchLatestLink = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get(`/properties/${propertyId}/download-ar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.arModel) setArModelLink(res.data.arModel);
      setShowPopup(true);
    } catch (err) {
      console.error("Error fetching AR model link:", err);
      alert("⚠️ AR model not ready yet.");
    } finally {
      setLoading(false);
    }
  };

  // Copy AR link to clipboard
  const copyLink = () => {
    if (arModelLink) {
      navigator.clipboard.writeText(arModelLink);
      alert("✅ AR model link copied!");
    }
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        {/* Generate Button */}
        <button
          onClick={generateAR}
          disabled={loading || !propertyFetched}
          className={`px-4 py-2 rounded-md ${
            loading || !propertyFetched
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {loading ? (status === "running" ? "Generating..." : "Starting...") : "Generate AR"}
        </button>

        {/* View/Get Link Button */}
        <button
          onClick={fetchLatestLink}
          disabled={loading}
          className={`px-4 py-2 rounded-md ${
            arModelLink ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          View AR Link
        </button>
      </div>

      {/* Progress Bar */}
      {loading && status === "running" && (
        <div className="w-full max-w-md mb-4">
          <div className="bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>Status: {status} | Progress: {progress}%</p>
        </div>
      )}

      {/* Popup Modal */}
      {showPopup && arModelLink && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold mb-4">AR Model Link</h2>
            <p className="mb-2 break-all text-sm">{arModelLink}</p>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Copy
              </button>
              <a
                href={arModelLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ARViewer;
