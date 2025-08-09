import express from 'express';
import {
    getPreferences,
    updatePreferences,
    updateNotificationPreferences,
    updateTheme,
    updateLanguage,
    updatePrivacyPreferences,
    updateAccessibilityPreferences,
    resetPreferences
} from '../controllers/preferencesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user preferences
router.get('/', getPreferences);

// Update all preferences
router.put('/', updatePreferences);

// Update specific preference categories
router.put('/notifications', updateNotificationPreferences);
router.put('/theme', updateTheme);
router.put('/language', updateLanguage);
router.put('/privacy', updatePrivacyPreferences);
router.put('/accessibility', updateAccessibilityPreferences);

// Reset preferences to default
router.post('/reset', resetPreferences);

export default router;
