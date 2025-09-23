import React, { useState } from "react";
import "@google/model-viewer";

const ARModelViewer = ({ onClose }) => {
  const [modelPath, setModelPath] = useState(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-3xl relative p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ✖
        </button>

        <h2 className="text-lg font-semibold mb-4">View 3D Model</h2>

        {/* File Input inside Modal */}
        {!modelPath && (
          <div>
            <label className="block text-gray-700 mb-2">
              Select local 3D model (.glb):
            </label>
            <input
              type="file"
              accept=".glb"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setModelPath(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="border rounded p-1 w-full"
            />
          </div>
        )}

        {/* Model Viewer */}
        {modelPath && (
          <model-viewer
            src={modelPath}
            alt="3D Model"
            auto-rotate
            camera-controls
            ar
            style={{ width: "100%", height: "600px" }}
          />
        )}
      </div>
    </div>
  );
};

export default ARModelViewer;
