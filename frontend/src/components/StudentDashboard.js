import React, { useState, useEffect } from 'react';
import { 
    BookOpen, 
    Calendar, 
    TrendingUp, 
    Bell, 
    User, 
    Search, 
    Plus,
    CheckCircle,
    Clock,
    AlertCircle,
    Award,
    Users,
    MessageSquare,
    Settings
} from 'lucide-react';

const StudentDashboard = ({ user, onNotificationClick }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [availableQuizzes, setAvailableQuizzes] = useState([]);
    const [completedQuizzes, setCompletedQuizzes] = useState([]);
    const [consultationInvites, setConsultationInvites] = useState([]);
    const [courseInvites, setCourseInvites] = useState([]);
    const [profileComplete, setProfileComplete] = useState(false);
    const [studentProfile, setStudentProfile] = useState({});
    const [activityHistory, setActivityHistory] = useState([]);

    useEffect(() => {
        loadStudentData();
        loadNotifications();
        checkProfileCompletion();
    }, []);

    const loadStudentData = () => {
        // Load student's data using email as key
        const studentData = JSON.parse(localStorage.getItem(`student_${user.email}`) || '{}');
        
        setEnrolledCourses(studentData.enrolledCourses || []);
        setAvailableQuizzes(studentData.availableQuizzes || []);
        setCompletedQuizzes(studentData.completedQuizzes || []);
        setConsultationInvites(studentData.consultationInvites || []);
        setCourseInvites(studentData.courseInvites || []);
        setActivityHistory(studentData.activityHistory || []);
        setStudentProfile(studentData.profile || {});
    };

    const saveStudentData = (data) => {
        localStorage.setItem(`student_${user.email}`, JSON.stringify(data));
    };

    const loadNotifications = () => {
        // Load notifications for this student
        const notifications = JSON.parse(localStorage.getItem(`notifications_${user.email}`) || '[]');
        
        // Filter different types of notifications
        const courseInvitations = notifications.filter(n => n.type === 'course_invitation' && !n.read);
        const consultationInvitations = notifications.filter(n => n.type === 'consultation_scheduled' && !n.read);
        const quizNotifications = notifications.filter(n => n.type === 'quiz_assigned' && !n.read);
        
        setCourseInvites(courseInvitations);
        setConsultationInvites(consultationInvitations);
        
        // Convert quiz notifications to available quizzes
        const quizzes = quizNotifications.map(notification => ({
            id: notification.quizId,
            title: notification.message.split('"')[1] || 'Quiz',
            classroomName: notification.classroomName,
            classroomId: notification.classroomId,
            dueDate: 'Soon',
            status: 'available',
            priority: notification.priority
        }));
        
        setAvailableQuizzes(prev => [...prev, ...quizzes]);
    };

    const checkProfileCompletion = () => {
        const profile = JSON.parse(localStorage.getItem(`student_profile_${user.email}`) || '{}');
        const isComplete = profile.firstName && profile.lastName && profile.dateOfBirth && profile.phone;
        setProfileComplete(isComplete);
        setStudentProfile(profile);
    };

    const completeProfile = (profileData) => {
        const updatedProfile = {
            ...profileData,
            email: user.email,
            completedAt: new Date().toISOString()
        };
        
        localStorage.setItem(`student_profile_${user.email}`, JSON.stringify(updatedProfile));
        setStudentProfile(updatedProfile);
        setProfileComplete(true);
        
        // Update user data with profile info
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedUser = {
            ...currentUser,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            profileComplete: true
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        alert('Profile completed successfully!');
    };

    const acceptCourseInvitation = (inviteId, classroomId, classroomName) => {
        // Add course to enrolled courses
        const newCourse = {
            id: classroomId,
            name: classroomName,
            enrolledAt: new Date().toISOString(),
            progress: 0,
            status: 'active'
        };
        
        const updatedCourses = [...enrolledCourses, newCourse];
        setEnrolledCourses(updatedCourses);
        
        // Update activity history
        const newActivity = {
            id: Date.now().toString(),
            type: 'course_enrolled',
            title: `Enrolled in ${classroomName}`,
            date: new Date().toISOString(),
            description: `Successfully joined ${classroomName}`
        };
        
        const updatedActivity = [...activityHistory, newActivity];
        setActivityHistory(updatedActivity);
        
        // Save data
        const studentData = {
            enrolledCourses: updatedCourses,
            availableQuizzes,
            completedQuizzes,
            consultationInvites,
            courseInvites: courseInvites.filter(invite => invite.id !== inviteId),
            activityHistory: updatedActivity,
            profile: studentProfile
        };
        saveStudentData(studentData);
        
        // Mark notification as read
        const notifications = JSON.parse(localStorage.getItem(`notifications_${user.email}`) || '[]');
        const updatedNotifications = notifications.map(n => 
            n.id === inviteId ? { ...n, read: true } : n
        );
        localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updatedNotifications));
        
        // Remove from course invites
        setCourseInvites(prev => prev.filter(invite => invite.id !== inviteId));
        
        alert(`Successfully joined ${classroomName}!`);
    };

    const acceptConsultationInvite = (inviteId, consultationData) => {
        // Add to accepted consultations
        const newConsultation = {
            id: consultationData.consultationId,
            teacherName: consultationData.teacherName,
            topic: consultationData.topic,
            scheduledDate: consultationData.scheduledDate,
            scheduledTime: consultationData.scheduledTime,
            status: 'accepted',
            acceptedAt: new Date().toISOString()
        };
        
        // Update activity history
        const newActivity = {
            id: Date.now().toString(),
            type: 'consultation_accepted',
            title: `Consultation Scheduled`,
            date: new Date().toISOString(),
            description: `Accepted consultation with ${consultationData.teacherName} for ${consultationData.topic}`
        };
        
        const updatedActivity = [...activityHistory, newActivity];
        setActivityHistory(updatedActivity);
        
        // Save data
        const studentData = {
            enrolledCourses,
            availableQuizzes,
            completedQuizzes,
            consultationInvites: consultationInvites.filter(invite => invite.id !== inviteId),
            courseInvites,
            activityHistory: updatedActivity,
            profile: studentProfile
        };
        saveStudentData(studentData);
        
        // Mark notification as read
        const notifications = JSON.parse(localStorage.getItem(`notifications_${user.email}`) || '[]');
        const updatedNotifications = notifications.map(n => 
            n.id === inviteId ? { ...n, read: true } : n
        );
        localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updatedNotifications));
        
        // Remove from consultation invites
        setConsultationInvites(prev => prev.filter(invite => invite.id !== inviteId));
        
        alert(`Consultation accepted! Meeting scheduled for ${consultationData.scheduledDate} at ${consultationData.scheduledTime}`);
    };

    const takeQuiz = (quizId, quizTitle) => {
        // Simulate taking a quiz
        const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
        
        const completedQuiz = {
            id: quizId,
            title: quizTitle,
            score: score,
            completedAt: new Date().toISOString(),
            status: 'completed'
        };
        
        const updatedCompletedQuizzes = [...completedQuizzes, completedQuiz];
        setCompletedQuizzes(updatedCompletedQuizzes);
        
        // Remove from available quizzes
        const updatedAvailableQuizzes = availableQuizzes.filter(quiz => quiz.id !== quizId);
        setAvailableQuizzes(updatedAvailableQuizzes);
        
        // Update activity history
        const newActivity = {
            id: Date.now().toString(),
            type: 'quiz_completed',
            title: `Completed ${quizTitle}`,
            date: new Date().toISOString(),
            description: `Scored ${score}% on ${quizTitle}`,
            score: score
        };
        
        const updatedActivity = [...activityHistory, newActivity];
        setActivityHistory(updatedActivity);
        
        // Save data
        const studentData = {
            enrolledCourses,
            availableQuizzes: updatedAvailableQuizzes,
            completedQuizzes: updatedCompletedQuizzes,
            consultationInvites,
            courseInvites,
            activityHistory: updatedActivity,
            profile: studentProfile
        };
        saveStudentData(studentData);
        
        // Update user's hasActivity flag
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedUser = {
            ...currentUser,
            hasActivity: true,
            quizzesTaken: (currentUser.quizzesTaken || 0) + 1,
            averageScore: score // Simplified - in real app would calculate average
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        alert(`Quiz completed! You scored ${score}%`);
    };

    const getDisplayName = () => {
        if (studentProfile.firstName && studentProfile.lastName) {
            return `${studentProfile.firstName} ${studentProfile.lastName}`;
        }
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        // Extract name from email
        const emailName = user.email.split('@')[0];
        return emailName.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getInitials = () => {
        const name = getDisplayName();
        const parts = name.split(' ');
        return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.substring(0, 2);
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Profile Completion Alert */}
            {!profileComplete && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-yellow-800">Complete Your Profile</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                Complete your profile to get personalized learning recommendations
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className="bg-yellow-400 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-500"
                        >
                            Complete Now
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                            <p className="text-3xl font-bold text-gray-900">{enrolledCourses.length}</p>
                        </div>
                        <BookOpen className="h-10 w-10 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Quizzes Completed</p>
                            <p className="text-3xl font-bold text-gray-900">{completedQuizzes.length}</p>
                        </div>
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Available Quizzes</p>
                            <p className="text-3xl font-bold text-gray-900">{availableQuizzes.length}</p>
                        </div>
                        <Clock className="h-10 w-10 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Score</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {completedQuizzes.length > 0 
                                    ? Math.round(completedQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / completedQuizzes.length)
                                    : 0}%
                            </p>
                        </div>
                        <Award className="h-10 w-10 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Pending Invitations */}
            {(courseInvites.length > 0 || consultationInvites.length > 0) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h3>
                    <div className="space-y-4">
                        {courseInvites.map(invite => (
                            <div key={invite.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center space-x-3">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">{invite.title}</p>
                                        <p className="text-sm text-gray-600">{invite.message}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => acceptCourseInvitation(invite.id, invite.classroomId, invite.classroomName)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        Accept
                                    </button>
                                    <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-sm">
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}

                        {consultationInvites.map(invite => (
                            <div key={invite.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">{invite.title}</p>
                                        <p className="text-sm text-gray-600">{invite.message}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => acceptConsultationInvite(invite.id, invite)}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                                    >
                                        Accept
                                    </button>
                                    <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-sm">
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {activityHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No activity yet. Start by taking a quiz or joining a course!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activityHistory.slice(-5).reverse().map(activity => (
                            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                    {activity.type === 'quiz_completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    {activity.type === 'course_enrolled' && <BookOpen className="h-5 w-5 text-blue-600" />}
                                    {activity.type === 'consultation_accepted' && <Calendar className="h-5 w-5 text-purple-600" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                    <p className="text-xs text-gray-500">{activity.description}</p>
                                    <p className="text-xs text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                                </div>
                                {activity.score && (
                                    <div className="flex-shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            activity.score >= 80 ? 'bg-green-100 text-green-800' :
                                            activity.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {activity.score}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome, {getDisplayName()}
                            </h1>
                            <p className="text-gray-600 mt-1">Student Dashboard - Track your learning progress</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onNotificationClick}
                                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Bell className="h-6 w-6" />
                                {(courseInvites.length + consultationInvites.length + availableQuizzes.length) > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {courseInvites.length + consultationInvites.length + availableQuizzes.length}
                                    </span>
                                )}
                            </button>
                            <div className="flex items-center space-x-3 bg-blue-50 px-3 py-2 rounded-lg">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {getInitials()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{getDisplayName()}</p>
                                    <p className="text-xs text-gray-600">Student</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview', icon: TrendingUp },
                            { id: 'courses', label: 'My Courses', icon: BookOpen },
                            { id: 'quizzes', label: 'Quizzes', icon: CheckCircle },
                            { id: 'profile', label: 'Profile', icon: User }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                                {tab.id === 'profile' && !profileComplete && (
                                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                        !
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && renderOverview()}
                
                {activeTab === 'quizzes' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Available Quizzes</h2>
                        </div>

                        {availableQuizzes.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
                                <p className="text-gray-600">Check back later for new quizzes from your teachers</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableQuizzes.map(quiz => (
                                    <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                                                <p className="text-sm text-gray-600">{quiz.classroomName}</p>
                                                <p className="text-xs text-gray-500 mt-1">Due: {quiz.dueDate}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                quiz.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                quiz.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {quiz.priority}
                                            </span>
                                        </div>
                                        
                                        <button
                                            onClick={() => takeQuiz(quiz.id, quiz.title)}
                                            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Take Quiz
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Completed Quizzes */}
                        {completedQuizzes.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Completed Quizzes</h3>
                                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="divide-y divide-gray-200">
                                        {completedQuizzes.map(quiz => (
                                            <div key={quiz.id} className="p-4 hover:bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            Completed on {new Date(quiz.completedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                        quiz.score >= 80 ? 'bg-green-100 text-green-800' :
                                                        quiz.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {quiz.score}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
                            
                            {profileComplete ? (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-green-600">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-medium">Profile Complete!</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                                            <p className="mt-1 text-sm text-gray-900">{studentProfile.firstName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                            <p className="mt-1 text-sm text-gray-900">{studentProfile.lastName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <p className="mt-1 text-sm text-gray-900">{studentProfile.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <p className="mt-1 text-sm text-gray-900">{studentProfile.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const profileData = {
                                        firstName: formData.get('firstName'),
                                        lastName: formData.get('lastName'),
                                        dateOfBirth: formData.get('dateOfBirth'),
                                        phone: formData.get('phone'),
                                        address: formData.get('address'),
                                        interests: formData.get('interests')
                                    };
                                    completeProfile(profileData);
                                }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name *</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                required
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your first name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                required
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your last name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                required
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <textarea
                                                name="address"
                                                rows={3}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your address"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Learning Interests</label>
                                            <textarea
                                                name="interests"
                                                rows={3}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="What subjects are you most interested in?"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Complete Profile
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
