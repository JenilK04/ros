import React, { useState, useEffect, useRef } from "react";
import "@google/model-viewer";
import API from "../../services/api";

const ARViewer = ({ propertyId }) => {
  const [arModel, setArModel] = useState(null); // Local URL to display
  const [arModelRemote, setArModelRemote] = useState(null); // Remote Tripo URL
  const [loading, setLoading] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [propertyFetched, setPropertyFetched] = useState(false);
  const intervalRef = useRef(null);

  // Fetch property data on mount
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/properties/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.arModel) setArModelRemote(res.data.arModel);
        if (res.data?.arModelLocal)
          setArModel(`http://localhost:5000/api/properties/${res.data.arModelLocal}`);
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
        const res = await API.get(`/properties/${propertyId}/ar-progress/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { progress: prog, status: stat, arModel } = res.data;
        setProgress(prog);
        setStatus(stat);

        if (stat === "success" && arModel) {
          clearInterval(intervalRef.current);
          downloadARModel(arModel);
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

  // Download AR model from remote to local server
  const downloadARModel = async (remoteUrl) => {
    if (!remoteUrl) return;

    try {
      setLoading(true);
      setProgress(0);
      setStatus("downloading");

      const token = localStorage.getItem("token");

      const res = await API.post(
        `/properties/download-ar`,
        { arModel: remoteUrl, propertyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.localPath) {
        const localUrl = `http://localhost:5000/api/properties/${res.data.localPath}`;
        setArModel(localUrl);
        setShowAR(true);
        setProgress(100);
        setStatus("success");
      } else {
        alert("❌ Failed to download AR model.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to download AR model:", err);
      setLoading(false);
      alert("⚠️ Error downloading AR model. Try again later.");
    }
  };

  // Trigger AR generation if needed
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

  // Handle AR view button
  const handleViewAR = async () => {
    if (!propertyFetched) return;

    if (arModel) {
      setShowAR(true); // Local exists → show immediately
      return;
    }

    if (arModelRemote && !arModel) {
      downloadARModel(arModelRemote); // Remote exists → download first
      return;
    }

    if (!arModelRemote && !arModel) {
      generateAR(); // Neither exists → generate
      return;
    }
  };

  return (
    <>
      <button
        onClick={handleViewAR}
        disabled={loading || !propertyFetched}
        className={`flex items-center gap-2 px-4 py-2 rounded-md mb-4 ${
          loading || !propertyFetched
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {loading
          ? status === "downloading"
            ? "Downloading AR..."
            : "Generating AR..."
          : "View in AR"}
      </button>

      {loading && (
        <>
          <div className="w-full max-w-md bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>Status: {status} | Progress: {progress}%</p>
        </>
      )}

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
