import express from 'express';
import { getProfile, getMe, updateProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get current user's profile
router.get('/me', getMe);

// Get any user's profile by id (requires auth; add role checks in controller if needed)
router.get('/:id', getProfile);

// Update profile (only self update allowed in controller)
router.put('/:id', updateProfile);

export default router;