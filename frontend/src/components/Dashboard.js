import React, { useState, useEffect } from 'react';
import { 
    Bell, 
    User, 
    Settings, 
    Activity, 
    MessageSquare, 
    BookOpen, 
    Award, 
    TrendingUp,
    Calendar,
    Users,
    Target,
    Clock,
    Star,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import NotificationBar from './NotificationBar';
// import UserProfile from './UserProfile';
import ActivityHistory from './ActivityHistory';
import LearningFeedback from './LearningFeedback';
import PreferencesManager from './PreferencesManager';

const Dashboard = ({ user, token, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        averageScore: 0,
        unreadNotifications: 0,
        feedbackShared: 0
    });

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'activity', label: 'Activity History', icon: Clock },
        { id: 'feedback', label: 'Learning Feedback', icon: MessageSquare },
        { id: 'preferences', label: 'Preferences', icon: Settings }
    ];

    useEffect(() => {
        // Fetch dashboard stats
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        // This would fetch real stats from the API
        setStats({
            totalQuizzes: 24,
            averageScore: 87.5,
            unreadNotifications: 3,
            feedbackShared: 8
        });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab user={user} stats={stats} />;
            case 'profile':
                return (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Profile component temporarily disabled</p>
                    </div>
                );
            case 'activity':
                return <ActivityHistory userId={user.id} token={token} />;
            case 'feedback':
                return <LearningFeedback userId={user.id} token={token} classCode={user.studentInfo?.classCode} />;
            case 'preferences':
                return <PreferencesManager userId={user.id} token={token} />;
            default:
                return <OverviewTab user={user} stats={stats} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Title */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">QuizzyVerse</h1>
                            </div>
                            
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <button
                                onClick={() => setShowNotifications(true)}
                                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Bell className="h-5 w-5" />
                                {stats.unreadNotifications > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {stats.unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    {user.profilePicture ? (
                                        <img 
                                            src={user.profilePicture} 
                                            alt="Profile" 
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-4 w-4 text-blue-600" />
                                    )}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={onLogout}
                                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className={`lg:w-64 ${showMobileMenu ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setShowMobileMenu(false);
                                            }}
                                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{tab.label}</span>
                                            {activeTab === tab.id && (
                                                <ChevronRight className="h-4 w-4 ml-auto" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {renderTabContent()}
                    </div>
                </div>
            </div>

            {/* Notification Bar */}
            <NotificationBar
                userId={user.id}
                token={token}
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ user, stats }) => {
    const quickStats = [
        {
            label: 'Total Quizzes',
            value: stats.totalQuizzes,
            icon: BookOpen,
            color: 'bg-blue-100 text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Average Score',
            value: `${stats.averageScore}%`,
            icon: TrendingUp,
            color: 'bg-green-100 text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Feedback Shared',
            value: stats.feedbackShared,
            icon: MessageSquare,
            color: 'bg-purple-100 text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            label: 'Achievements',
            value: 12,
            icon: Award,
            color: 'bg-yellow-100 text-yellow-600',
            bgColor: 'bg-yellow-50'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 👋</h2>
                        <p className="text-blue-100">Ready to continue your learning journey?</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <Star className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {[
                            { action: 'Completed Mathematics Quiz', time: '2 hours ago', score: '95%' },
                            { action: 'Shared study technique feedback', time: '1 day ago', likes: '12 likes' },
                            { action: 'Updated profile information', time: '2 days ago', status: 'completed' }
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Activity className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                                {activity.score && (
                                    <span className="text-sm font-medium text-green-600">{activity.score}</span>
                                )}
                                {activity.likes && (
                                    <span className="text-sm font-medium text-purple-600">{activity.likes}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
