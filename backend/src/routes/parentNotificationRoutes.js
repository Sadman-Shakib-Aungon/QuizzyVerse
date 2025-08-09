import express from 'express';
import {
    createParentNotification,
    getParentNotifications,
    getStudentNotifications,
    acknowledgeNotification,
    retryEmailNotification
} from '../controllers/parentNotificationController.js';
import { 
    authenticateToken, 
    requireParent, 
    requireTeacherOrAdmin,
    canAccessStudentData 
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create parent notification (teachers/admins only)
router.post('/', requireTeacherOrAdmin, createParentNotification);

// Get parent notifications (parents only)
router.get('/parent', requireParent, getParentNotifications);

// Get notifications for a specific student
router.get('/student/:studentId', canAccessStudentData, getStudentNotifications);

// Acknowledge notification (parents only)
router.post('/:id/acknowledge', requireParent, acknowledgeNotification);

// Retry failed email notification (admins only)
router.post('/:id/retry-email', requireTeacherOrAdmin, retryEmailNotification);

export default router;
