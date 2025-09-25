import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authroutes.js';
import propertiesRoute from './routes/propertiesRoute.js';
import adminroutes from './routes/adminroutes.js';
import eventRoutes from './routes/eventRoutes.js';
import postHogRoutes from './routes/postHogRoutes.js';
import path from "path";
import { fileURLToPath } from "url";
const app = express();
dotenv.config();
app.use(cors());

// ✅ Set payload size limit to 16MB (you can increase further if needed)
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error', err));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/models", express.static(path.join(__dirname, "models")));

// Routes
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoute);
app.use('/api/admin',adminroutes);
app.use('/api/admin/analytics', postHogRoutes);
app.use('/api', eventRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
