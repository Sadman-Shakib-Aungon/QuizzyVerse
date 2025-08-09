import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import parentNotificationRoutes from './routes/parentNotificationRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect('mongodb://localhost:27017/quizzyverse')
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/parent-notifications', parentNotificationRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/quizzes', quizRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'QuizzyVerse API is running' });
});

// Serve frontend build (for production / live)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.resolve(__dirname, '../../frontend/build');

if (fs.existsSync(frontendBuildPath)) {
  // Serve static assets from React build
  app.use(express.static(frontendBuildPath));

  // For any non-API route, send React index.html (SPA fallback)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexFile = path.join(frontendBuildPath, 'index.html');
    if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
    next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler for API or when no frontend build exists
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Route not found' });
  }
  res.status(404).send('Not found');
});

const PORT = process.env.PORT || 1566;
app.listen(PORT, () => {
  console.log(`QuizzyVerse Backend Server running on port ${PORT}`);
  console.log(`available at http://localhost:${PORT}`);
});

