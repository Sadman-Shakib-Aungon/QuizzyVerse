import express from 'express';
import {
    createConsultation,
    getStudentConsultations,
    getConsultantConsultations,
    scheduleConsultation,
    updateConsultationStatus,
    addConsultationFeedback,
    getAvailableConsultants,
    getConsultationById
} from '../controllers/consultationController.js';
import { 
    authenticateToken, 
    requireConsultant, 
    requireTeacherOrAdmin,
    canAccessStudentData 
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create consultation (teachers/admins only)
router.post('/', requireTeacherOrAdmin, createConsultation);

// Get consultations for a student
router.get('/student/:studentId', canAccessStudentData, getStudentConsultations);

// Get consultations for current consultant
router.get('/consultant', requireConsultant, getConsultantConsultations);

// Get available consultants for a subject
router.get('/consultants/:subject', getAvailableConsultants);

// Get consultation by ID
router.get('/:id', getConsultationById);

// Schedule consultation
router.put('/:id/schedule', scheduleConsultation);

// Update consultation status
router.put('/:id/status', updateConsultationStatus);

// Add feedback to consultation
router.post('/:id/feedback', addConsultationFeedback);

export default router;
