import express from 'express';
import {
    createFeedback,
    getClassFeedback,
    getFeedbackById,
    toggleLike,
    addComment,
    updateFeedback,
    deleteFeedback,
    approveFeedback,
    getMyFeedback,
    upload
} from '../controllers/feedbackController.js';
import { authenticateToken, requireStudent, requireTeacherOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create new feedback (students only, with file upload)
router.post('/', requireStudent, upload.array('attachments', 5), createFeedback);

// Get user's own feedback
router.get('/my-feedback', getMyFeedback);

// Get feedback for a specific class
router.get('/class/:classCode', getClassFeedback);

// Get single feedback by ID
router.get('/:id', getFeedbackById);

// Like/Unlike feedback
router.post('/:id/like', toggleLike);

// Add comment to feedback
router.post('/:id/comments', addComment);

// Update feedback (author or admin only)
router.put('/:id', updateFeedback);

// Delete feedback (author or admin only)
router.delete('/:id', deleteFeedback);

// Approve feedback (admin/teacher only)
router.post('/:id/approve', requireTeacherOrAdmin, approveFeedback);

export default router;
