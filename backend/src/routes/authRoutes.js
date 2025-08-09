import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Root auth endpoint (no auth required)
router.get('/', (req, res) => {
    res.json({
        message: 'Auth API is working',
        endpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/profile (requires token)',
            'PUT /api/auth/profile (requires token)',
            'POST /api/auth/logout (requires token)'
        ],
        timestamp: new Date().toISOString()
    });
});

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Test route (no auth required)
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes working', timestamp: new Date().toISOString() });
});

// Protected routes
router.use(authenticateToken); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/logout', logout);

export default router;
