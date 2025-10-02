// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // seller
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   // buyer
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
