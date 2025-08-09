import React, { useState, useEffect } from 'react';
import { Settings, Bell, Palette, Globe, Shield, Eye } from 'lucide-react';
import axios from 'axios';

// Feature 3: User Preferences Management Component
const PreferencesManager = ({ userId, token }) => {
    const [preferences, setPreferences] = useState({
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
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('notifications');

    const API_BASE = 'http://localhost:1566/api';

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await axios.get(`${API_BASE}/preferences`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPreferences(response.data.preferences);
        } catch (error) {
            console.error('Error fetching preferences:', error);
            setMessage('Failed to load preferences');
        } finally {
            setLoading(false);
        }
    };

    const updatePreferences = async (updatedPreferences) => {
        setSaving(true);
        try {
            await axios.put(`${API_BASE}/preferences`, 
                { preferences: updatedPreferences },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPreferences(updatedPreferences);
            setMessage('Preferences updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating preferences:', error);
            setMessage('Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationChange = (key, value) => {
        const updated = {
            ...preferences,
            notifications: {
                ...preferences.notifications,
                [key]: value
            }
        };
        updatePreferences(updated);
    };

    const handleThemeChange = (theme) => {
        const updated = { ...preferences, theme };
        updatePreferences(updated);
    };

    const handleLanguageChange = (language) => {
        const updated = { ...preferences, language };
        updatePreferences(updated);
    };

    const handlePrivacyChange = (key, value) => {
        const updated = {
            ...preferences,
            privacy: {
                ...preferences.privacy,
                [key]: value
            }
        };
        updatePreferences(updated);
    };

    const handleAccessibilityChange = (key, value) => {
        const updated = {
            ...preferences,
            accessibility: {
                ...preferences.accessibility,
                [key]: value
            }
        };
        updatePreferences(updated);
    };

    const resetToDefaults = async () => {
        setSaving(true);
        try {
            await axios.post(`${API_BASE}/preferences/reset`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchPreferences();
            setMessage('Preferences reset to defaults!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error resetting preferences:', error);
            setMessage('Failed to reset preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'language', label: 'Language', icon: Globe },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'accessibility', label: 'Accessibility', icon: Eye }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
                <Settings className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">Preferences</h2>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md ${
                    message.includes('success') || message.includes('reset') 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                    {message}
                </div>
            )}

            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 mr-4 rounded-t-lg transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-6">
                {activeTab === 'notifications' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                        <div className="space-y-4">
                            {Object.entries(preferences.notifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => handleNotificationChange(key, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Theme
                                </label>
                                <select
                                    value={preferences.theme}
                                    onChange={(e) => handleThemeChange(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'language' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Language Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language
                                </label>
                                <select
                                    value={preferences.language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="zh">Chinese</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Visibility
                                </label>
                                <select
                                    value={preferences.privacy.profileVisibility}
                                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="public">Public</option>
                                    <option value="friends">Friends Only</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">
                                    Share Progress
                                </label>
                                <input
                                    type="checkbox"
                                    checked={preferences.privacy.shareProgress}
                                    onChange={(e) => handlePrivacyChange('shareProgress', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">
                                    Allow Feedback
                                </label>
                                <input
                                    type="checkbox"
                                    checked={preferences.privacy.allowFeedback}
                                    onChange={(e) => handlePrivacyChange('allowFeedback', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'accessibility' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Font Size
                                </label>
                                <select
                                    value={preferences.accessibility.fontSize}
                                    onChange={(e) => handleAccessibilityChange('fontSize', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">
                                    High Contrast
                                </label>
                                <input
                                    type="checkbox"
                                    checked={preferences.accessibility.highContrast}
                                    onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">
                                    Screen Reader Support
                                </label>
                                <input
                                    type="checkbox"
                                    checked={preferences.accessibility.screenReader}
                                    onChange={(e) => handleAccessibilityChange('screenReader', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-between">
                <button
                    onClick={resetToDefaults}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    Reset to Defaults
                </button>
                <div className="text-sm text-gray-500">
                    {saving && 'Saving...'}
                </div>
            </div>
        </div>
    );
};

export default PreferencesManager;
