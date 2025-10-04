import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authroutes.js';
import propertiesRoute from './routes/propertiesRoute.js';
import adminroutes from './routes/adminroutes.js';
import eventRoutes from './routes/eventRoutes.js';
import postHogRoutes from './routes/postHogRoutes.js';
import newsRoutes from "./routes/newsRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import notificationRoute from './routes/notificationRoute.js';
dotenv.config();
const app = express();

// ✅ CORS & JSON Parsing
app.use(cors());
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error', err));

// Static path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/models", express.static(path.join(__dirname, "models")));

// Routes
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoute);
app.use('/api/admin', adminroutes);
app.use('/api/analytics', postHogRoutes);
app.use('/api', eventRoutes);
app.use('/api',notificationRoute)
app.use("/api/news", newsRoutes);
// ✅ Create HTTP server & attach Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" } // change "*" to your frontend URL in production
});

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register user to a room by userId
  socket.on("register", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
