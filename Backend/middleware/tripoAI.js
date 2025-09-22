// services/arService.js
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import Property from "../models/Property.js"; // Note the .js extension in ESM
import dotenv from 'dotenv';
dotenv.config();


const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const tempDir = path.join(path.resolve(), "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Upload base64 image to Tripo
export async function uploadBase64ToTripo(base64Image, fileName = "temp.jpg") {
  try {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const tempPath = path.join(tempDir, fileName);
    fs.writeFileSync(tempPath, buffer);

    const form = new FormData();
    form.append("file", fs.createReadStream(tempPath));

    const res = await axios.post(
      "https://api.tripo3d.ai/v2/openapi/upload/sts",
      form,
      {
        headers: {
          Authorization: `Bearer ${TRIPO_API_KEY}`,
          ...form.getHeaders(),
        },
      }
    );

    fs.unlinkSync(tempPath);

    console.log("Tripo upload response:", res.data);

    const imageToken = res.data?.data?.image_token || res.data?.image_token;
    if (!imageToken) throw new Error("Upload failed: image_token not returned");

    return imageToken;
  } catch (err) {
    console.error("Error uploading image to Tripo:", err.message);
    throw err;
  }
}

// Generate AR model for a property with proper status handling
export async function generateARFromProperty(propertyId, onProgress = null) {
  try {
    const property = await Property.findById(propertyId);
    if (!property || !property.images || property.images.length === 0) {
      throw new Error("Property or images not found");
    }

    // Upload all images
    const imageTokens = [];
    for (let i = 0; i < property.images.length; i++) {
      const token = await uploadBase64ToTripo(
        property.images[i],
        `property_${property._id}_${i}.jpg`
      );
      imageTokens.push(token);
    }

    // Create Tripo task
    const taskResp = await axios.post(
      "https://api.tripo3d.ai/v2/openapi/task",
      {
        type: "image_to_model",
        file:
          imageTokens.length === 1
            ? { file_token: imageTokens[0], type: "jpg" }
            : undefined,
        object:
          imageTokens.length > 1
            ? imageTokens.map((token) => ({ file_token: token, type: "jpg" }))
            : undefined,
        model_version: "v2.5-20250123",
        pbr: true,
        texture: true,
      },
      { headers: { Authorization: `Bearer ${TRIPO_API_KEY}` } }
    );

    const taskId = taskResp.data?.data?.task_id;
    if (!taskId) throw new Error("Failed to create Tripo task");

    // Poll for task completion
    let modelUrl = null;
    const maxRetries = 120; // up to 10 minutes
    const waitTime = 5000; // 5 seconds

    for (let i = 0; i < maxRetries; i++) {
      const statusRes = await axios.get(
        `https://api.tripo3d.ai/v2/openapi/task/${taskId}`,
        { headers: { Authorization: `Bearer ${TRIPO_API_KEY}` } }
      );

      const statusData = statusRes.data?.data;
      if (!statusData) throw new Error("Invalid Tripo status response");

      if (statusData.status === "success") {
        // Task completed successfully
        modelUrl =
          statusData.output?.model ||
          statusData.output?.base_model ||
          statusData.output?.pbr_model;
        break;
      } else if (
        ["failed", "banned", "expired", "cancelled", "unknown"].includes(
          statusData.status
        )
      ) {
        throw new Error(`3D model generation failed: ${statusData.status}`);
      } else if (["queued", "running"].includes(statusData.status)) {
        const progress = statusData.progress || 0;
        console.log(`AR task in progress: ${progress}%`);
        if (onProgress && typeof onProgress === "function") onProgress(progress);
        await new Promise((r) => setTimeout(r, waitTime));
      }
    }

    if (!modelUrl) throw new Error("3D model generation timed out");

    // Save model URL in property
    property.arModel = modelUrl;
    await property.save();

    console.log("3D model saved for property:", property._id);
    return modelUrl;
  } catch (err) {
    console.error("Error generating AR for property:", err.message);
    throw err;
  }
}
