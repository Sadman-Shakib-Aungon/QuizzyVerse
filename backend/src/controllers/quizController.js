import { QuizCompletionService } from '../services/quizCompletionService.js';
import User from '../models/User.js';

// Handle quiz completion and trigger notifications/consultations
export const completeQuiz = async (req, res) => {
    try {
        const { studentId, quizResult } = req.body;

        // Validate required fields
        if (!studentId || !quizResult) {
            return res.status(400).json({ 
                message: 'Student ID and quiz result are required' 
            });
        }

        const requiredFields = ['quizId', 'title', 'subject', 'score', 'totalMarks'];
        const missingFields = requiredFields.filter(field => !quizResult[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required quiz result fields: ${missingFields.join(', ')}` 
            });
        }

        // Update student's activity history
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Add to activity history
        student.activityHistory.push({
            quizId: quizResult.quizId,
            score: quizResult.score,
            takenAt: new Date(),
            subject: quizResult.subject
        });
        await student.save();

        // Process quiz completion (trigger notifications and consultations)
        const result = await QuizCompletionService.processQuizCompletion(studentId, quizResult);

        res.json({
            message: 'Quiz completion processed successfully',
            result
        });

    } catch (error) {
        console.error('Complete quiz error:', error);
        res.status(500).json({ 
            message: 'Failed to process quiz completion', 
            error: error.message 
        });
    }
};

// Batch process multiple quiz completions
export const batchCompleteQuizzes = async (req, res) => {
    try {
        const { completions } = req.body;

        if (!completions || !Array.isArray(completions)) {
            return res.status(400).json({ 
                message: 'Completions array is required' 
            });
        }

        const results = await QuizCompletionService.batchProcessQuizCompletions(completions);

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        res.json({
            message: 'Batch quiz completion processed',
            summary: {
                total: results.length,
                successful: successCount,
                failed: failureCount
            },
            results
        });

    } catch (error) {
        console.error('Batch complete quizzes error:', error);
        res.status(500).json({ 
            message: 'Failed to process batch quiz completions', 
            error: error.message 
        });
    }
};

// Get student performance summary
export const getStudentPerformance = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Verify access permissions
        const user = await User.findById(req.userId);
        if (user.role === 'student' && user._id.toString() !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        } else if (user.role === 'parent') {
            const student = await User.findById(studentId);
            if (!student || student.studentInfo.parentEmail !== user.email) {
                return res.status(403).json({ message: 'Access denied - not your child' });
            }
        } else if (!['admin', 'teacher'].includes(user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const summary = await QuizCompletionService.getStudentPerformanceSummary(studentId);

        res.json({
            message: 'Student performance summary retrieved successfully',
            summary
        });

    } catch (error) {
        console.error('Get student performance error:', error);
        res.status(500).json({ 
            message: 'Failed to get student performance', 
            error: error.message 
        });
    }
};

// Get system statistics (admin only)
export const getSystemStatistics = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const statistics = await QuizCompletionService.getSystemStatistics();

        res.json({
            message: 'System statistics retrieved successfully',
            statistics
        });

    } catch (error) {
        console.error('Get system statistics error:', error);
        res.status(500).json({ 
            message: 'Failed to get system statistics', 
            error: error.message 
        });
    }
};

// Simulate quiz completion for testing
export const simulateQuizCompletion = async (req, res) => {
    try {
        const { studentId, subject, score, totalMarks } = req.body;

        // Only allow in development environment
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ message: 'Simulation not allowed in production' });
        }

        const mockQuizResult = {
            quizId: 'mock_' + Date.now(),
            title: `Mock ${subject} Quiz`,
            subject: subject || 'Mathematics',
            score: score || 30,
            totalMarks: totalMarks || 100,
            passingMarks: Math.ceil((totalMarks || 100) * 0.6)
        };

        const result = await QuizCompletionService.processQuizCompletion(studentId, mockQuizResult);

        res.json({
            message: 'Quiz completion simulated successfully',
            mockQuizResult,
            result
        });

    } catch (error) {
        console.error('Simulate quiz completion error:', error);
        res.status(500).json({ 
            message: 'Failed to simulate quiz completion', 
            error: error.message 
        });
    }
};
