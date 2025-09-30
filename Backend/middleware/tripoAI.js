// services/arService.js
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import Property from "../models/Property.js"; 
import dotenv from "dotenv";
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

    const headers = {
      Authorization: `Bearer ${TRIPO_API_KEY}`,
      ...form.getHeaders(),
    };

    const res = await axios.post(
      "https://api.tripo3d.ai/v2/openapi/upload/sts",
      form,
      { headers }
    );

    fs.unlinkSync(tempPath);

    const imageToken = res.data?.data?.image_token || res.data?.image_token;
    if (!imageToken) throw new Error("Upload failed: image_token not returned");

    return imageToken;
  } catch (err) {
    console.error("❌ Upload error:", err.response?.data || err.message);
    throw err;
  }
}

// Generate AR model for a property
export async function generateARFromProperty(propertyId, onProgress = null) {
  try {
    const property = await Property.findById(propertyId);
    if (!property || !property.images || property.images.length === 0) {
      throw new Error("Property or images not found");
    }

    // Upload images to Tripo
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

    console.log(`🆔 Task created for property ${propertyId}: ${taskId}`);

    // Poll for completion
    const maxRetries = 120;
    const waitTime = 5000;

    for (let i = 0; i < maxRetries; i++) {
      const statusRes = await axios.get(
        `https://api.tripo3d.ai/v2/openapi/task/${taskId}`,
        { headers: { Authorization: `Bearer ${TRIPO_API_KEY}` } }
      );

      const statusData = statusRes.data?.data;
      if (!statusData) throw new Error("Invalid Tripo status response");

      if (statusData.status === "success") {
        // Only save links that exist
        let selectedLink =
          statusData.output?.pbr_model ||
          statusData.output?.model ||
          statusData.output?.base_model ||
          statusData.output?.rendered_image ||
          null;

        if (!selectedLink) {
          throw new Error("No valid model link found in Tripo output");
        }

        // Save only ONE string in arModel
        property.arTaskId = taskId;
        property.arModel = [selectedLink]; // still an array but with 1 string
        await property.save();

        console.log(`✅ AR model generated & saved for property ${propertyId}`);
        return selectedLink;
      } else if (
        ["failed", "banned", "expired", "cancelled", "unknown"].includes(
          statusData.status
        )
      ) {
        throw new Error(`3D model generation failed: ${statusData.status}`);
      } else if (["queued", "running"].includes(statusData.status)) {
        const progress = statusData.progress || 0;
        if (onProgress && typeof onProgress === "function") onProgress(progress);
        await new Promise((r) => setTimeout(r, waitTime));
      }
    }

    throw new Error("3D model generation timed out");
  } catch (err) {
    console.error("❌ AR generation error:", err.response?.data || err.message);
    throw err;
  }
}
