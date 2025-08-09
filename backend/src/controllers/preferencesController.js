import User from '../models/User.js';

// Feature 3: User Preferences Management

// Get user preferences
export const getPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('preferences');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Preferences retrieved successfully',
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ message: 'Failed to get preferences', error: error.message });
    }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
    try {
        const { preferences } = req.body;

        if (!preferences) {
            return res.status(400).json({ message: 'Preferences data is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { preferences } },
            { new: true, runValidators: true }
        ).select('preferences');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Preferences updated successfully',
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ message: 'Failed to update preferences', error: error.message });
    }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
    try {
        const { notifications } = req.body;

        if (!notifications) {
            return res.status(400).json({ message: 'Notification preferences are required' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { 'preferences.notifications': notifications } },
            { new: true, runValidators: true }
        ).select('preferences.notifications');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Notification preferences updated successfully',
            notifications: user.preferences.notifications
        });
    } catch (error) {
        console.error('Update notification preferences error:', error);
        res.status(500).json({ message: 'Failed to update notification preferences', error: error.message });
    }
};

// Update theme preference
export const updateTheme = async (req, res) => {
    try {
        const { theme } = req.body;

        if (!theme || !['light', 'dark', 'auto'].includes(theme)) {
            return res.status(400).json({ message: 'Valid theme is required (light, dark, auto)' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { 'preferences.theme': theme } },
            { new: true, runValidators: true }
        ).select('preferences.theme');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Theme updated successfully',
            theme: user.preferences.theme
        });
    } catch (error) {
        console.error('Update theme error:', error);
        res.status(500).json({ message: 'Failed to update theme', error: error.message });
    }
};

// Update language preference
export const updateLanguage = async (req, res) => {
    try {
        const { language } = req.body;

        if (!language) {
            return res.status(400).json({ message: 'Language is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { 'preferences.language': language } },
            { new: true, runValidators: true }
        ).select('preferences.language');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Language updated successfully',
            language: user.preferences.language
        });
    } catch (error) {
        console.error('Update language error:', error);
        res.status(500).json({ message: 'Failed to update language', error: error.message });
    }
};

// Update privacy preferences
export const updatePrivacyPreferences = async (req, res) => {
    try {
        const { privacy } = req.body;

        if (!privacy) {
            return res.status(400).json({ message: 'Privacy preferences are required' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { 'preferences.privacy': privacy } },
            { new: true, runValidators: true }
        ).select('preferences.privacy');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Privacy preferences updated successfully',
            privacy: user.preferences.privacy
        });
    } catch (error) {
        console.error('Update privacy preferences error:', error);
        res.status(500).json({ message: 'Failed to update privacy preferences', error: error.message });
    }
};

// Update accessibility preferences
export const updateAccessibilityPreferences = async (req, res) => {
    try {
        const { accessibility } = req.body;

        if (!accessibility) {
            return res.status(400).json({ message: 'Accessibility preferences are required' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { 'preferences.accessibility': accessibility } },
            { new: true, runValidators: true }
        ).select('preferences.accessibility');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Accessibility preferences updated successfully',
            accessibility: user.preferences.accessibility
        });
    } catch (error) {
        console.error('Update accessibility preferences error:', error);
        res.status(500).json({ message: 'Failed to update accessibility preferences', error: error.message });
    }
};

// Reset preferences to default
export const resetPreferences = async (req, res) => {
    try {
        const defaultPreferences = {
            notifications: {
                email: true,
                push: true,
                sms: false,
                quizReminders: true,
                scoreUpdates: true,
                parentNotifications: true
            },
            theme: 'light',
            language: 'en',
            privacy: {
                profileVisibility: 'friends',
                shareProgress: true,
                allowFeedback: true
            },
            accessibility: {
                fontSize: 'medium',
                highContrast: false,
                screenReader: false
            }
        };

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { preferences: defaultPreferences } },
            { new: true, runValidators: true }
        ).select('preferences');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Preferences reset to default successfully',
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Reset preferences error:', error);
        res.status(500).json({ message: 'Failed to reset preferences', error: error.message });
    }
};
