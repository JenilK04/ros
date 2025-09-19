// frontend/components/ARViewer.jsx
import React, { useState, useEffect } from "react";
import "@google/model-viewer";
import API from "../../services/api";

const ARViewer = ({ propertyId }) => {
  const [arModel, setArModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");

  const handleViewAR = async () => {
    try {
      setLoading(true);
      setProgress(0);
      setStatus("starting");

      const token = localStorage.getItem("token");

      // 🔹 Step 1: Trigger AR generation
      await API.post( `/properties/${propertyId}/generate-ar`,{ headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("running");

      // 🔹 Step 2: Poll progress every 2 seconds
      const interval = setInterval(async () => {
        try {
          const progressRes = await API.get(`/properties/${propertyId}/ar-progress/`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const { progress, status, arModel } = progressRes.data;
          setProgress(progress);
          setStatus(status);

          if (status === "success") {
            setArModel(arModel);
            setShowAR(true);
            clearInterval(interval);
            setLoading(false);
          } else if (status === "failed") {
            clearInterval(interval);
            setLoading(false);
            alert("❌ AR generation failed!");
          }
        } catch (err) {
          console.error("Error fetching AR progress:", err);
          clearInterval(interval);
          setLoading(false);
        }
      }, 2000);
    } catch (err) {
      console.error("Failed to start AR generation:", err);
      setLoading(false);
      alert("⚠️ Error generating AR model. Try again later.");
    }
  };

  return (
    <>
      <button
        onClick={handleViewAR}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-md mb-4 ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {loading ? "Generating AR..." : "View in AR"}
      </button>

      {/* 🔹 Progress Bar */}
      {loading && (
        <div className="w-full max-w-md bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {loading && <p>Status: {status} | Progress: {progress}%</p>}

      {/* 🔹 AR Modal */}
      {showAR && arModel && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative w-full max-w-3xl bg-white rounded-lg p-4">
            <button
              onClick={() => setShowAR(false)}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 font-bold"
            >
              ✖
            </button>

            <model-viewer
              src={arModel}
              alt="AR Model"
              ar
              auto-rotate
              camera-controls
              style={{ width: "100%", height: "500px" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ARViewer;
