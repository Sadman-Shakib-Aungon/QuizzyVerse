import express from 'express';
import {
    completeQuiz,
    batchCompleteQuizzes,
    getStudentPerformance,
    getSystemStatistics,
    simulateQuizCompletion
} from '../controllers/quizController.js';
import { 
    authenticateToken, 
    requireAdmin, 
    requireTeacherOrAdmin,
    canAccessStudentData 
} from '../middleware/auth.js';

const router = express.Router();

// Test route (no auth required)
router.get('/test', (req, res) => {
    res.json({ message: 'Quiz routes working', timestamp: new Date().toISOString() });
});

// All routes require authentication
router.use(authenticateToken);

// Complete quiz and trigger notifications/consultations
router.post('/complete', requireTeacherOrAdmin, completeQuiz);

// Batch complete multiple quizzes
router.post('/batch-complete', requireTeacherOrAdmin, batchCompleteQuizzes);

// Get student performance summary
router.get('/performance/:studentId', canAccessStudentData, getStudentPerformance);

// Get system statistics (admin only)
router.get('/statistics', requireAdmin, getSystemStatistics);

// Simulate quiz completion for testing (development only)
router.post('/simulate', simulateQuizCompletion);

export default router;
