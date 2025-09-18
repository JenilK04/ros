// components/ARViewer.jsx
import React, { useEffect, useState } from "react";
import "@google/model-viewer";
import API from "../../services/api";

const ARViewer = ({ propertyId }) => {
  const [arStatus, setArStatus] = useState("PENDING");
  const [arModel, setArModel] = useState(null);
  const [showAR, setShowAR] = useState(false);

  useEffect(() => {
    let interval;

    const fetchAR = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/properties/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { arStatus, arModel } = res.data;

        setArStatus(arStatus);
        setArModel(arModel);

        if (arStatus === "PENDING" && !interval) {
          interval = setInterval(fetchAR, 5000); // poll every 5s
        } else if (arStatus !== "PENDING" && interval) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to fetch AR status:", err);
      }
    };

    fetchAR();

    return () => clearInterval(interval);
  }, [propertyId]);

  if (!arModel) {
    if (arStatus === "PENDING") return <p className="text-gray-500 mb-4">🔄 AR model is generating…</p>;
    if (arStatus === "FAILED") return <p className="text-red-500 mb-4">❌ AR generation failed.</p>;
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowAR(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4"
      >
        View in AR
      </button>

      {showAR && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative w-full max-w-3xl bg-white rounded-lg p-4">
            <button
              onClick={() => setShowAR(false)}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 font-bold"
            >
              Close
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
