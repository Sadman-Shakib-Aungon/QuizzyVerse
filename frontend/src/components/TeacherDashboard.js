import React, { useState, useEffect } from 'react';
import { 
    Users, 
    BookOpen, 
    Calendar, 
    AlertTriangle, 
    Plus, 
    Settings, 
    TrendingUp,
    MessageSquare,
    Bell,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Send
} from 'lucide-react';

const TeacherDashboard = ({ user, onNotificationClick }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [classrooms, setClassrooms] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [lowPerformingStudents, setLowPerformingStudents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalType, setModalType] = useState('');

    useEffect(() => {
        loadTeacherData();
    }, []);

    const loadTeacherData = () => {
        // Load teacher's data - using email as key for consistency
        const teacherData = JSON.parse(localStorage.getItem(`teacher_${user.email}`) || '{}');

        setClassrooms(teacherData.classrooms || []);
        setQuizzes(teacherData.quizzes || []);
        setConsultations(teacherData.consultations || []);
        setLowPerformingStudents(teacherData.lowPerformingStudents || []);
        setAnnouncements(teacherData.announcements || []);
    };

    const saveTeacherData = (data) => {
        localStorage.setItem(`teacher_${user.email}`, JSON.stringify(data));
    };

    // Classroom Management Functions
    const createClassroom = (classroomData) => {
        const newClassroom = {
            id: Date.now().toString(),
            name: classroomData.name,
            subject: classroomData.subject,
            description: classroomData.description,
            students: [],
            createdAt: new Date().toISOString(),
            teacherId: user.id
        };

        const updatedClassrooms = [...classrooms, newClassroom];
        setClassrooms(updatedClassrooms);
        
        const teacherData = { classrooms: updatedClassrooms, quizzes, consultations, lowPerformingStudents, announcements };
        saveTeacherData(teacherData);
    };

    const addStudentToClassroom = (classroomId, studentEmail) => {
        const updatedClassrooms = classrooms.map(classroom => {
            if (classroom.id === classroomId) {
                const newStudent = {
                    id: Date.now().toString(),
                    email: studentEmail,
                    name: studentEmail.split('@')[0], // Extract name from email
                    joinedAt: new Date().toISOString(),
                    scores: []
                };
                return {
                    ...classroom,
                    students: [...classroom.students, newStudent]
                };
            }
            return classroom;
        });

        setClassrooms(updatedClassrooms);
        const teacherData = { classrooms: updatedClassrooms, quizzes, consultations, lowPerformingStudents, announcements };
        saveTeacherData(teacherData);

        // Send invitation notification to student
        sendStudentInvitation(studentEmail, classroomId);
    };

    const sendStudentInvitation = (studentEmail, classroomId) => {
        const classroom = classrooms.find(c => c.id === classroomId);
        const invitation = {
            id: Date.now().toString(),
            type: 'course_invitation',
            title: 'Course Invitation',
            message: `You have been invited to join ${classroom.name} (${classroom.subject})`,
            studentEmail: studentEmail,
            classroomId: classroomId,
            teacherId: user.id,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'medium'
        };

        // Store invitation in student's notifications
        const studentNotifications = JSON.parse(localStorage.getItem(`notifications_${studentEmail}`) || '[]');
        studentNotifications.push(invitation);
        localStorage.setItem(`notifications_${studentEmail}`, JSON.stringify(studentNotifications));
    };

    // Quiz Management Functions
    const createQuiz = (quizData) => {
        const newQuiz = {
            id: Date.now().toString(),
            title: quizData.title,
            subject: quizData.subject,
            classroomId: quizData.classroomId,
            questions: quizData.questions,
            timeLimit: quizData.timeLimit,
            totalMarks: quizData.questions.reduce((sum, q) => sum + q.marks, 0),
            createdAt: new Date().toISOString(),
            teacherId: user.id,
            submissions: []
        };

        const updatedQuizzes = [...quizzes, newQuiz];
        setQuizzes(updatedQuizzes);
        
        const teacherData = { classrooms, quizzes: updatedQuizzes, consultations, lowPerformingStudents, announcements };
        saveTeacherData(teacherData);

        // Notify students in the classroom
        notifyStudentsAboutQuiz(newQuiz);
    };

    const notifyStudentsAboutQuiz = (quiz) => {
        const classroom = classrooms.find(c => c.id === quiz.classroomId);
        if (classroom) {
            classroom.students.forEach(student => {
                const notification = {
                    id: Date.now().toString() + student.id,
                    type: 'quiz_assigned',
                    title: 'New Quiz Available',
                    message: `${quiz.title} has been assigned to ${classroom.name}`,
                    quizId: quiz.id,
                    classroomId: classroom.id,
                    timestamp: new Date().toISOString(),
                    read: false,
                    priority: 'high'
                };

                const studentNotifications = JSON.parse(localStorage.getItem(`notifications_${student.email}`) || '[]');
                studentNotifications.push(notification);
                localStorage.setItem(`notifications_${student.email}`, JSON.stringify(studentNotifications));
            });
        }
    };

    // Consultation Management Functions
    const scheduleConsultation = (consultationData) => {
        const newConsultation = {
            id: Date.now().toString(),
            studentId: consultationData.studentId,
            studentName: consultationData.studentName,
            studentEmail: consultationData.studentEmail,
            topic: consultationData.topic,
            scheduledDate: consultationData.scheduledDate,
            scheduledTime: consultationData.scheduledTime,
            status: 'scheduled',
            notes: consultationData.notes || '',
            createdAt: new Date().toISOString(),
            teacherId: user.id
        };

        const updatedConsultations = [...consultations, newConsultation];
        setConsultations(updatedConsultations);
        
        const teacherData = { classrooms, quizzes, consultations: updatedConsultations, lowPerformingStudents, announcements };
        saveTeacherData(teacherData);

        // Send consultation invitation to student
        sendConsultationInvitation(newConsultation);
    };

    const sendConsultationInvitation = (consultation) => {
        const invitation = {
            id: Date.now().toString(),
            type: 'consultation_scheduled',
            title: 'Consultation Scheduled',
            message: `Your teacher has scheduled a consultation for ${consultation.topic} on ${consultation.scheduledDate} at ${consultation.scheduledTime}`,
            consultationId: consultation.id,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'high'
        };

        const studentNotifications = JSON.parse(localStorage.getItem(`notifications_${consultation.studentEmail}`) || '[]');
        studentNotifications.push(invitation);
        localStorage.setItem(`notifications_${consultation.studentEmail}`, JSON.stringify(studentNotifications));
    };

    // Low Marks Detection
    const identifyLowPerformingStudents = () => {
        const lowPerformers = [];
        
        classrooms.forEach(classroom => {
            classroom.students.forEach(student => {
                const recentScores = student.scores.slice(-3); // Last 3 quiz scores
                const averageScore = recentScores.length > 0 
                    ? recentScores.reduce((sum, score) => sum + score.percentage, 0) / recentScores.length 
                    : 0;

                if (averageScore < 60 && recentScores.length > 0) {
                    lowPerformers.push({
                        ...student,
                        classroomId: classroom.id,
                        classroomName: classroom.name,
                        averageScore: Math.round(averageScore),
                        needsConsultation: true
                    });
                }
            });
        });

        setLowPerformingStudents(lowPerformers);
        
        // Generate notifications for low marks
        generateLowMarksNotifications(lowPerformers);
        
        const teacherData = { classrooms, quizzes, consultations, lowPerformingStudents: lowPerformers, announcements };
        saveTeacherData(teacherData);
    };

    const generateLowMarksNotifications = (lowPerformers) => {
        lowPerformers.forEach(student => {
            const notification = {
                id: Date.now().toString() + student.id,
                type: 'low_score',
                title: 'Consultation Recommended',
                message: `Your recent performance in ${student.classroomName} indicates you may benefit from additional support. Your teacher recommends scheduling a consultation.`,
                studentId: student.id,
                classroomId: student.classroomId,
                averageScore: student.averageScore,
                timestamp: new Date().toISOString(),
                read: false,
                priority: 'high'
            };

            const studentNotifications = JSON.parse(localStorage.getItem(`notifications_${student.email}`) || '[]');
            studentNotifications.push(notification);
            localStorage.setItem(`notifications_${student.email}`, JSON.stringify(studentNotifications));
        });
    };

    // Announcement Functions
    const sendAnnouncement = (announcementData) => {
        const newAnnouncement = {
            id: Date.now().toString(),
            title: announcementData.title,
            message: announcementData.message,
            classroomId: announcementData.classroomId,
            priority: announcementData.priority,
            createdAt: new Date().toISOString(),
            teacherId: user.id
        };

        const updatedAnnouncements = [...announcements, newAnnouncement];
        setAnnouncements(updatedAnnouncements);
        
        const teacherData = { classrooms, quizzes, consultations, lowPerformingStudents, announcements: updatedAnnouncements };
        saveTeacherData(teacherData);

        // Send announcement to all students in classroom
        const classroom = classrooms.find(c => c.id === announcementData.classroomId);
        if (classroom) {
            classroom.students.forEach(student => {
                const notification = {
                    id: Date.now().toString() + student.id,
                    type: 'announcement',
                    title: newAnnouncement.title,
                    message: newAnnouncement.message,
                    classroomId: classroom.id,
                    timestamp: new Date().toISOString(),
                    read: false,
                    priority: announcementData.priority
                };

                const studentNotifications = JSON.parse(localStorage.getItem(`notifications_${student.email}`) || '[]');
                studentNotifications.push(notification);
                localStorage.setItem(`notifications_${student.email}`, JSON.stringify(studentNotifications));
            });
        }
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Classrooms</p>
                        <p className="text-2xl font-bold text-gray-900">{classrooms.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {classrooms.reduce((total, classroom) => total + classroom.students.length, 0)}
                        </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-600" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
                        <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Need Help</p>
                        <p className="text-2xl font-bold text-gray-900">{lowPerformingStudents.length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
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
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome, {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-gray-600">Teacher Dashboard</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onNotificationClick}
                                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            >
                                <Bell className="h-6 w-6" />
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </button>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-700">Teacher</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: TrendingUp },
                            { id: 'classrooms', label: 'Classrooms', icon: Users },
                            { id: 'quizzes', label: 'Quizzes', icon: BookOpen },
                            { id: 'consultations', label: 'Consultations', icon: Calendar },
                            { id: 'students', label: 'Students Needing Help', icon: AlertTriangle },
                            { id: 'announcements', label: 'Announcements', icon: MessageSquare }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && renderOverview()}
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={() => {
                            setModalType('classroom');
                            setShowCreateModal(true);
                        }}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create Classroom</span>
                    </button>
                    
                    <button
                        onClick={() => {
                            setModalType('quiz');
                            setShowCreateModal(true);
                        }}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create Quiz</span>
                    </button>
                    
                    <button
                        onClick={() => {
                            setModalType('consultation');
                            setShowCreateModal(true);
                        }}
                        className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Schedule Consultation</span>
                    </button>
                    
                    <button
                        onClick={identifyLowPerformingStudents}
                        className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        <span>Check Low Performers</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
