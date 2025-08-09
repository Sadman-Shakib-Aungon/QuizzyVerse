import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, Clock, Filter, Search } from 'lucide-react';
import axios from 'axios';

const NotificationBar = ({ userId, token, isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const API_BASE = 'http://localhost:1566/api';

    useEffect(() => {
        if (isOpen && userId) {
            fetchNotifications();
        }
    }, [isOpen, userId, filter]);

    const fetchNotifications = async (pageNum = 1) => {
        try {
            setLoading(pageNum === 1);
            const response = await axios.get(`${API_BASE}/notifications/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: pageNum,
                    limit: 10,
                    read: filter === 'all' ? undefined : filter === 'read'
                }
            });

            const newNotifications = response.data.notifications || [];

            if (pageNum === 1) {
                setNotifications(newNotifications);
            } else {
                setNotifications(prev => [...prev, ...newNotifications]);
            }

            setHasMore(newNotifications.length === 10);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`${API_BASE}/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${API_BASE}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`${API_BASE}/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.filter(notif => notif._id !== notificationId)
            );
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'quiz_completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'quiz_assigned':
                return <Clock className="h-5 w-5 text-blue-500" />;
            case 'low_score':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'consultation_scheduled':
                return <Info className="h-5 w-5 text-purple-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const filteredNotifications = notifications.filter(notif =>
        notif.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const unreadCount = notifications.filter(notif => !notif.read).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Bell className="h-6 w-6" />
                            <h2 className="text-xl font-bold">Notifications</h2>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="mt-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white opacity-70" />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            />
                        </div>

                        <div className="flex space-x-2">
                            {['all', 'unread', 'read'].map((filterType) => (
                                <button
                                    key={filterType}
                                    onClick={() => setFilter(filterType)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filter === filterType
                                            ? 'bg-white text-blue-600'
                                            : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                    }`}
                                >
                                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                </button>
                            ))}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-white hover:text-opacity-80 underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto h-full pb-20">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                            <Bell className="h-12 w-12 mb-2 opacity-50" />
                            <p>No notifications found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 hover:bg-gray-50 transition-colors ${
                                        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {getTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex-shrink-0 flex space-x-1">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Load More */}
                    {hasMore && !loading && filteredNotifications.length > 0 && (
                        <div className="p-4 text-center">
                            <button
                                onClick={() => fetchNotifications(page + 1)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Load more notifications
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationBar;