import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  propertyId: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
