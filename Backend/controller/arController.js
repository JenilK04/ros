const axios = require("axios");
const Property = require("../models/Property");

// 🔑 Meshy API Key
const MESHY_API_KEY = process.env.MESHY_API_KEY;

/**
 * Step 1: Create a Meshy 3D task
 */
async function createImageTo3D(imageUrls) {
  const url = "https://api.meshy.ai/openapi/v1/multi-image-to-3d";
  const headers = {
    Authorization: `Bearer ${MESHY_API_KEY}`,
    "Content-Type": "application/json",
  };

  const body = {
    image_urls: imageUrls, // array of image URLs
    enable_pbr: true,
    should_remesh: true,
    should_texture: true,
    ai_model: "meshy-5",
    topology: "triangle",
    target_polycount: 30000
  };

  const resp = await axios.post(url, body, { headers });
  return resp.data.result.task_id; // ✅ return only task ID
}

/**
 * Step 2: Poll the Meshy task until model is ready
 */
async function getTaskResult(taskId) {
  const url = `https://api.meshy.ai/openapi/v1/multi-image-to-3d/${taskId}`;
  const headers = { Authorization: `Bearer ${MESHY_API_KEY}` };
  const resp = await axios.get(url, { headers });
  return resp.data.result; // contains status, model_urls, etc.
}

/**
 * Controller: Generate AR model for a property
 */
const generateARForProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: "Property not found" });

    const imageUrls = property.images; // array of URLs from DB
    if (!imageUrls || imageUrls.length === 0) {
      return res.status(400).json({ error: "No images available for this property" });
    }

    // 1️⃣ Create Meshy task
    const taskId = await createImageTo3D(imageUrls);

    // 2️⃣ Poll until model is ready
    let modelUrl = null;
    const maxRetries = 60; // ~5 minutes
    for (let i = 0; i < maxRetries; i++) {
      const result = await getTaskResult(taskId);

      if (result.status === "SUCCEEDED") {
        modelUrl = result.model_urls?.glb;
        break;
      } else if (result.status === "FAILED") {
        throw new Error(result.task_error || "Meshy task failed");
      }

      // wait 5 seconds before next poll
      await new Promise((r) => setTimeout(r, 5000));
    }

    if (!modelUrl) {
      return res.status(500).json({ error: "Model generation timed out" });
    }

    // 3️⃣ Save GLB URL in MongoDB
    property.arModel = modelUrl;
    await property.save();

    res.json({ success: true, modelUrl });
  } catch (err) {
    console.error("Error generating AR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { generateARForProperty };
