import React, { useState, useEffect } from 'react';
import { 
    Activity, 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    Award, 
    BookOpen, 
    Clock,
    Filter,
    BarChart3,
    PieChart,
    Target
} from 'lucide-react';
import axios from 'axios';

const ActivityHistory = ({ userId, token }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, recent, subject
    const [selectedSubject, setSelectedSubject] = useState('');
    const [timeRange, setTimeRange] = useState('30'); // days
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        recentTrend: 'stable'
    });

    const API_BASE = 'http://localhost:1566/api';

    useEffect(() => {
        fetchActivityHistory();
        fetchStats();
    }, [userId, timeRange, selectedSubject]);

    const fetchActivityHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            let userActivities = response.data.user.activityHistory || [];
            
            // Filter by time range
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
            
            userActivities = userActivities.filter(activity => 
                new Date(activity.takenAt) >= cutoffDate
            );
            
            // Filter by subject if selected
            if (selectedSubject) {
                userActivities = userActivities.filter(activity => 
                    activity.subject === selectedSubject
                );
            }
            
            // Sort by date (most recent first)
            userActivities.sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));
            
            setActivities(userActivities);
        } catch (error) {
            console.error('Error fetching activity history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_BASE}/quizzes/performance/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const performance = response.data.summary.performance;
            setStats({
                totalQuizzes: performance.totalQuizzes,
                averageScore: performance.averageScore,
                bestScore: Math.max(...activities.map(a => a.score), 0),
                recentTrend: calculateTrend()
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const calculateTrend = () => {
        if (activities.length < 2) return 'stable';
        
        const recent = activities.slice(0, 3);
        const older = activities.slice(3, 6);
        
        const recentAvg = recent.reduce((sum, a) => sum + a.score, 0) / recent.length;
        const olderAvg = older.reduce((sum, a) => sum + a.score, 0) / older.length;
        
        if (recentAvg > olderAvg + 5) return 'up';
        if (recentAvg < olderAvg - 5) return 'down';
        return 'stable';
    };

    const getSubjects = () => {
        const subjects = [...new Set(activities.map(activity => activity.subject))];
        return subjects.filter(Boolean);
    };

    const getScoreColor = (score, maxScore = 100) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 90) return 'text-green-600 bg-green-100';
        if (percentage >= 80) return 'text-blue-600 bg-blue-100';
        if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
        if (percentage >= 60) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

    const getGrade = (score, maxScore = 100) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 85) return 'A';
        if (percentage >= 80) return 'A-';
        if (percentage >= 75) return 'B+';
        if (percentage >= 70) return 'B';
        if (percentage >= 65) return 'B-';
        if (percentage >= 60) return 'C+';
        if (percentage >= 55) return 'C';
        if (percentage >= 50) return 'C-';
        return 'F';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTrendIcon = () => {
        switch (stats.recentTrend) {
            case 'up':
                return <TrendingUp className="h-5 w-5 text-green-500" />;
            case 'down':
                return <TrendingDown className="h-5 w-5 text-red-500" />;
            default:
                return <Target className="h-5 w-5 text-blue-500" />;
        }
    };

    const getSubjectStats = () => {
        const subjectData = {};
        activities.forEach(activity => {
            if (!subjectData[activity.subject]) {
                subjectData[activity.subject] = {
                    count: 0,
                    totalScore: 0,
                    scores: []
                };
            }
            subjectData[activity.subject].count++;
            subjectData[activity.subject].totalScore += activity.score;
            subjectData[activity.subject].scores.push(activity.score);
        });

        return Object.entries(subjectData).map(([subject, data]) => ({
            subject,
            count: data.count,
            average: (data.totalScore / data.count).toFixed(1),
            best: Math.max(...data.scores),
            worst: Math.min(...data.scores)
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const subjectStats = getSubjectStats();

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Activity className="h-8 w-8" />
                        <div>
                            <h1 className="text-2xl font-bold">Activity History</h1>
                            <p className="text-purple-100">Track your learning progress and achievements</p>
                        </div>
                    </div>
                    {getTrendIcon()}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Score</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Best Score</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.bestScore}%</p>
                        </div>
                        <Award className="h-8 w-8 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Recent Trend</p>
                            <p className="text-2xl font-bold text-gray-900 capitalize">{stats.recentTrend}</p>
                        </div>
                        {getTrendIcon()}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 3 months</option>
                        <option value="365">Last year</option>
                    </select>

                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Subjects</option>
                        {getSubjects().map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Subject Performance */}
            {subjectStats.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-blue-500" />
                        Subject Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjectStats.map((stat) => (
                            <div key={stat.subject} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">{stat.subject}</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quizzes:</span>
                                        <span className="font-medium">{stat.count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Average:</span>
                                        <span className="font-medium">{stat.average}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Best:</span>
                                        <span className="font-medium text-green-600">{stat.best}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Activity List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-500" />
                        Recent Activities
                    </h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {activities.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No quiz activities found for the selected period.</p>
                        </div>
                    ) : (
                        activities.map((activity, index) => (
                            <div key={`${activity.quizId}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {activity.subject} Quiz
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(activity.takenAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(activity.score)}`}>
                                                {activity.score}% ({getGrade(activity.score)})
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Score: {activity.score}/100
                                            </p>
                                        </div>

                                        <div className="w-16 h-16">
                                            <div className="relative w-full h-full">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                    <path
                                                        className="text-gray-200"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <path
                                                        className={activity.score >= 80 ? 'text-green-500' : activity.score >= 60 ? 'text-yellow-500' : 'text-red-500'}
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        fill="none"
                                                        strokeDasharray={`${activity.score}, 100`}
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {activity.score}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityHistory;
