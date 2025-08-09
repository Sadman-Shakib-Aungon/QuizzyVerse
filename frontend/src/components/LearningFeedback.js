import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Heart, 
    Share2, 
    Plus, 
    Search, 
    Filter, 
    BookOpen, 
    Users, 
    ThumbsUp,
    MessageCircle,
    Eye,
    Tag,
    Clock,
    Send,
    X,
    Upload
} from 'lucide-react';
import axios from 'axios';

const LearningFeedback = ({ userId, token, classCode }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [newFeedback, setNewFeedback] = useState({
        title: '',
        content: '',
        subject: '',
        category: 'study_technique',
        tags: ''
    });
    const [message, setMessage] = useState('');

    const API_BASE = 'http://localhost:1566/api';

    const categories = [
        { value: 'study_technique', label: 'Study Technique', icon: '📚' },
        { value: 'exam_strategy', label: 'Exam Strategy', icon: '🎯' },
        { value: 'time_management', label: 'Time Management', icon: '⏰' },
        { value: 'resource_sharing', label: 'Resource Sharing', icon: '📖' },
        { value: 'motivation', label: 'Motivation', icon: '💪' },
        { value: 'other', label: 'Other', icon: '💡' }
    ];

    useEffect(() => {
        if (classCode) {
            fetchFeedbacks();
        }
    }, [classCode, selectedSubject, selectedCategory, sortBy]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/feedback/class/${classCode}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    subject: selectedSubject || undefined,
                    category: selectedCategory || undefined,
                    sortBy,
                    sortOrder: 'desc'
                }
            });
            setFeedbacks(response.data.feedbacks || []);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const createFeedback = async () => {
        try {
            const response = await axios.post(`${API_BASE}/feedback`, {
                ...newFeedback,
                classCode,
                tags: newFeedback.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFeedbacks(prev => [response.data.feedback, ...prev]);
            setNewFeedback({
                title: '',
                content: '',
                subject: '',
                category: 'study_technique',
                tags: ''
            });
            setShowCreateForm(false);
            setMessage('Learning feedback shared successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error creating feedback:', error);
            setMessage('Failed to share feedback');
        }
    };

    const toggleLike = async (feedbackId) => {
        try {
            const response = await axios.post(`${API_BASE}/feedback/${feedbackId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFeedbacks(prev => prev.map(feedback => 
                feedback._id === feedbackId 
                    ? { ...feedback, likeCount: response.data.likeCount, isLiked: response.data.isLiked }
                    : feedback
            ));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const addComment = async (feedbackId, content) => {
        try {
            const response = await axios.post(`${API_BASE}/feedback/${feedbackId}/comments`, {
                content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFeedbacks(prev => prev.map(feedback => 
                feedback._id === feedbackId 
                    ? { ...feedback, comments: [...feedback.comments, response.data.comment] }
                    : feedback
            ));
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const feedbackDate = new Date(date);
        const diffInMinutes = Math.floor((now - feedbackDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.value === category);
        return cat ? cat.icon : '💡';
    };

    const getCategoryLabel = (category) => {
        const cat = categories.find(c => c.value === category);
        return cat ? cat.label : 'Other';
    };

    const filteredFeedbacks = feedbacks.filter(feedback =>
        feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const subjects = [...new Set(feedbacks.map(f => f.subject))].filter(Boolean);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <MessageSquare className="h-8 w-8" />
                        <div>
                            <h1 className="text-2xl font-bold">Learning Feedback</h1>
                            <p className="text-green-100">Share and discover study techniques with your classmates</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Share Feedback
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${
                    message.includes('success') 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                    {message}
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search feedback..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.icon} {category.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="createdAt">Latest</option>
                        <option value="likes">Most Liked</option>
                        <option value="views">Most Viewed</option>
                        <option value="comments">Most Discussed</option>
                    </select>
                </div>
            </div>

            {/* Create Feedback Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowCreateForm(false)}></div>
                        
                        <div className="relative bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Share Learning Feedback</h3>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newFeedback.title}
                                        onChange={(e) => setNewFeedback(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Give your feedback a catchy title..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={newFeedback.subject}
                                            onChange={(e) => setNewFeedback(prev => ({ ...prev, subject: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Mathematics, Physics..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={newFeedback.category}
                                            onChange={(e) => setNewFeedback(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {categories.map(category => (
                                                <option key={category.value} value={category.value}>
                                                    {category.icon} {category.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content
                                    </label>
                                    <textarea
                                        value={newFeedback.content}
                                        onChange={(e) => setNewFeedback(prev => ({ ...prev, content: e.target.value }))}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Share your learning technique, study strategy, or helpful tip..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={newFeedback.tags}
                                        onChange={(e) => setNewFeedback(prev => ({ ...prev, tags: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., flashcards, memory, practice, notes..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createFeedback}
                                        disabled={!newFeedback.title || !newFeedback.content}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Share Feedback
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredFeedbacks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                        <p className="text-gray-500">Be the first to share your learning experience!</p>
                    </div>
                ) : (
                    filteredFeedbacks.map((feedback) => (
                        <FeedbackCard
                            key={feedback._id}
                            feedback={feedback}
                            onLike={() => toggleLike(feedback._id)}
                            onComment={(content) => addComment(feedback._id, content)}
                            getTimeAgo={getTimeAgo}
                            getCategoryIcon={getCategoryIcon}
                            getCategoryLabel={getCategoryLabel}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Feedback Card Component
const FeedbackCard = ({ feedback, onLike, onComment, getTimeAgo, getCategoryIcon, getCategoryLabel }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const handleComment = () => {
        if (newComment.trim()) {
            onComment(newComment.trim());
            setNewComment('');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">{feedback.author.name}</h4>
                            <p className="text-sm text-gray-500">{getTimeAgo(feedback.createdAt)}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getCategoryIcon(feedback.category)} {getCategoryLabel(feedback.category)}
                        </span>
                        {feedback.subject && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {feedback.subject}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feedback.title}</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{feedback.content}</p>

                {/* Tags */}
                {feedback.tags && feedback.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {feedback.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={onLike}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                                feedback.isLiked
                                    ? 'bg-red-100 text-red-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Heart className={`h-4 w-4 ${feedback.isLiked ? 'fill-current' : ''}`} />
                            <span className="text-sm font-medium">{feedback.likeCount || 0}</span>
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">{feedback.comments?.length || 0}</span>
                        </button>

                        <div className="flex items-center space-x-2 text-gray-500">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">{feedback.views || 0}</span>
                        </div>
                    </div>

                    <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors">
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Share</span>
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* Add Comment */}
                        <div className="flex space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                                    />
                                    <button
                                        onClick={handleComment}
                                        disabled={!newComment.trim()}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                            {feedback.comments?.map((comment, index) => (
                                <div key={index} className="flex space-x-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Users className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {comment.author?.name || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {getTimeAgo(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningFeedback;
