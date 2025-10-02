// controllers/inquiryController.js
import Notification from "../models/notification.js";
import Message from "../models/message.js";
import Property from "../models/Property.js";
import User from "../models/Users.js";


export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.id
    }).sort({ createdAt: -1 }); // latest first
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getMyLeads = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: -1 });

    const leads = {};

    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      // Skip if otherUserId is same as logged-in user
      if (otherUserId === userId) continue;

      const propertyId = msg.propertyId.toString();

      if (!leads[otherUserId + propertyId]) {
        const otherUser = await User.findById(otherUserId);
        leads[otherUserId + propertyId] = {
          userId: otherUserId,
          name: otherUser?.firstName + " " + otherUser?.lastName || "Unknown",
          propertyId,
          lastMessage: msg.text,
          lastTime: msg.timestamp,
        };
      }
    }

    res.json(Object.values(leads));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load leads" });
  }
};



// POST /chat/:propertyId
export const privateChat = async (req, res) => {
  const { propertyId } = req.params;
  const { senderId, text } = req.body;

  try {
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: "Property not found" });

    const receiverId = property.userId; // seller is the property owner

    const msg = new Message({
      senderId,
      receiverId,
      propertyId,
      text,
      timestamp: new Date(),
    });

    await msg.save();

    // Emit to both sender and receiver rooms
    // Room naming: "chat-propertyId-userId1-userId2" (sorted for uniqueness)
    const room = [senderId, receiverId].sort().join("-");
    req.io?.to(room).emit("newMessage", msg);

    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// GET /chat/:propertyId
export const getChatMessages = async (req, res) => {
  const { propertyId } = req.params;
  const { userId } = req.query; // optional: current logged-in user for filtering

  try {
    // Find all messages for this property
    const messages = await Message.find({ propertyId })
      .sort({ timestamp: 1 }); // oldest first

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};


