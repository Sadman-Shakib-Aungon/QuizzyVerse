import ParentNotification from '../models/ParentNotification.js';
import Consultation from '../models/Consultation.js';
import User from '../models/User.js';

// Service to handle quiz completion and trigger notifications/consultations
export class QuizCompletionService {
    
    // Process quiz completion and trigger appropriate actions
    static async processQuizCompletion(studentId, quizResult) {
        try {
            const results = {
                parentNotification: null,
                consultation: null,
                errors: []
            };

            // Calculate percentage
            const percentage = (quizResult.score / quizResult.totalMarks) * 100;
            const lowScoreThreshold = parseInt(process.env.LOW_SCORE_THRESHOLD) || 60;

            // Only process if score is below threshold
            if (percentage >= lowScoreThreshold) {
                return {
                    message: 'Score above threshold - no actions needed',
                    percentage,
                    threshold: lowScoreThreshold
                };
            }

            // Get student information
            const student = await User.findById(studentId);
            if (!student) {
                throw new Error('Student not found');
            }

            // Feature 14: Create parent notification for low marks
            try {
                const parentNotification = await ParentNotification.createFromQuizResult(studentId, quizResult);
                if (parentNotification) {
                    results.parentNotification = {
                        id: parentNotification._id,
                        created: true,
                        emailSent: parentNotification.emailDetails.emailStatus === 'sent'
                    };
                }
            } catch (error) {
                console.error('Parent notification error:', error);
                results.errors.push({
                    type: 'parent_notification',
                    message: error.message
                });
            }

            // Feature 15: Create consultation for low marks
            try {
                const consultation = await Consultation.autoAssignConsultant(studentId, quizResult);
                if (consultation) {
                    results.consultation = {
                        id: consultation._id,
                        created: true,
                        consultant: consultation.consultant,
                        priority: consultation.priority
                    };

                    // Update student's weak areas
                    if (!student.studentInfo.weakAreas.includes(quizResult.subject)) {
                        student.studentInfo.weakAreas.push(quizResult.subject);
                        await student.save();
                    }
                }
            } catch (error) {
                console.error('Consultation creation error:', error);
                results.errors.push({
                    type: 'consultation',
                    message: error.message
                });
            }

            return {
                message: 'Quiz completion processed successfully',
                studentId,
                quizResult,
                percentage,
                threshold: lowScoreThreshold,
                results
            };

        } catch (error) {
            console.error('Quiz completion processing error:', error);
            throw error;
        }
    }

    // Batch process multiple quiz completions
    static async batchProcessQuizCompletions(completions) {
        const results = [];
        
        for (const completion of completions) {
            try {
                const result = await this.processQuizCompletion(completion.studentId, completion.quizResult);
                results.push({
                    studentId: completion.studentId,
                    quizId: completion.quizResult.quizId,
                    success: true,
                    result
                });
            } catch (error) {
                results.push({
                    studentId: completion.studentId,
                    quizId: completion.quizResult.quizId,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    // Get student performance summary
    static async getStudentPerformanceSummary(studentId) {
        try {
            const student = await User.findById(studentId);
            if (!student) {
                throw new Error('Student not found');
            }

            // Get recent quiz scores
            const recentQuizzes = student.activityHistory
                .sort((a, b) => b.takenAt - a.takenAt)
                .slice(0, 10);

            // Get parent notifications
            const parentNotifications = await ParentNotification.find({
                student: studentId,
                isActive: true
            }).sort({ createdAt: -1 }).limit(5);

            // Get consultations
            const consultations = await Consultation.find({
                student: studentId,
                isActive: true
            })
            .populate('consultant', 'name consultantInfo')
            .sort({ createdAt: -1 })
            .limit(5);

            // Calculate performance metrics
            const totalQuizzes = recentQuizzes.length;
            const averageScore = totalQuizzes > 0 
                ? recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes 
                : 0;

            const lowScoreCount = parentNotifications.length;
            const consultationCount = consultations.length;

            // Subject-wise performance
            const subjectPerformance = {};
            recentQuizzes.forEach(quiz => {
                if (!subjectPerformance[quiz.subject]) {
                    subjectPerformance[quiz.subject] = {
                        totalQuizzes: 0,
                        totalScore: 0,
                        averageScore: 0,
                        lowScoreCount: 0
                    };
                }
                subjectPerformance[quiz.subject].totalQuizzes++;
                subjectPerformance[quiz.subject].totalScore += quiz.score;
            });

            // Calculate averages
            Object.keys(subjectPerformance).forEach(subject => {
                const perf = subjectPerformance[subject];
                perf.averageScore = perf.totalScore / perf.totalQuizzes;
                perf.lowScoreCount = parentNotifications.filter(
                    notif => notif.quiz.subject === subject
                ).length;
            });

            return {
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    classCode: student.studentInfo.classCode,
                    weakAreas: student.studentInfo.weakAreas
                },
                performance: {
                    totalQuizzes,
                    averageScore,
                    lowScoreCount,
                    consultationCount,
                    subjectPerformance
                },
                recentActivity: {
                    quizzes: recentQuizzes,
                    parentNotifications: parentNotifications.map(notif => ({
                        id: notif._id,
                        subject: notif.quiz.subject,
                        score: notif.score,
                        createdAt: notif.createdAt,
                        acknowledged: notif.parentResponse.acknowledged
                    })),
                    consultations: consultations.map(consult => ({
                        id: consult._id,
                        subject: consult.triggerQuiz.subject,
                        consultant: consult.consultant.name,
                        status: consult.status,
                        scheduledDateTime: consult.scheduledDateTime,
                        createdAt: consult.createdAt
                    }))
                }
            };

        } catch (error) {
            console.error('Get student performance summary error:', error);
            throw error;
        }
    }

    // Get system statistics
    static async getSystemStatistics() {
        try {
            const totalParentNotifications = await ParentNotification.countDocuments({ isActive: true });
            const totalConsultations = await Consultation.countDocuments({ isActive: true });
            
            const notificationsByStatus = await ParentNotification.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$emailDetails.emailStatus', count: { $sum: 1 } } }
            ]);

            const consultationsByStatus = await Consultation.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);

            const consultationsBySubject = await Consultation.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$triggerQuiz.subject', count: { $sum: 1 } } }
            ]);

            return {
                parentNotifications: {
                    total: totalParentNotifications,
                    byStatus: notificationsByStatus
                },
                consultations: {
                    total: totalConsultations,
                    byStatus: consultationsByStatus,
                    bySubject: consultationsBySubject
                }
            };

        } catch (error) {
            console.error('Get system statistics error:', error);
            throw error;
        }
    }
}
