import Event from '../models/event.js';
import User from '../models/Users.js';

export const addEvent = async (req, res) => {
  try {
    const { title, description, date, category, targetAudience, location, images } = req.body;

    if (!title || !date || !category || !location) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const event = new Event({
      title,
      description,
      date,
      category,
      targetAudience,
      location,
      images,
      createdBy: req.user.id
    });

    const savedEvent = await event.save();
    res.status(201).json({ success: true, event: savedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // sorted by date ascending
    res.status(200).json({ success: true, events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
};