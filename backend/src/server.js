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

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect('mongodb://localhost:27017/quizzyverse', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 1566;
app.listen(PORT, () => {
  console.log(`QuizzyVerse Backend Server running on port ${PORT}`);
  console.log(`available at http://localhost:${PORT}`);
});

