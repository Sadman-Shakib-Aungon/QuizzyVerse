import ParentNotification from '../models/ParentNotification.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Feature 14: Parent Notification System for Low Marks

// Configure email transporter
const createEmailTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send email notification to parent
const sendEmailNotification = async (notification) => {
    try {
        const transporter = createEmailTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: notification.parent.email,
            subject: notification.message.subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #dc3545; margin-bottom: 20px;">📊 Quiz Performance Alert</h2>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3>Student Information</h3>
                            <p><strong>Name:</strong> ${notification.student.name}</p>
                            <p><strong>Subject:</strong> ${notification.quiz.subject}</p>
                            <p><strong>Quiz:</strong> ${notification.quiz.title}</p>
                        </div>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3>Performance Details</h3>
                            <p><strong>Score:</strong> ${notification.score.obtained}/${notification.quiz.totalMarks}</p>
                            <p><strong>Percentage:</strong> ${notification.score.percentage.toFixed(1)}%</p>
                            <p><strong>Grade:</strong> ${notification.score.grade}</p>
                            <p><strong>Passing Marks:</strong> ${notification.quiz.passingMarks}</p>
                        </div>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3>Message</h3>
                            <p>${notification.message.body}</p>
                        </div>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3>Recommendations</h3>
                            <ul>
                                ${notification.message.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #6c757d;">
                                This is an automated notification from QuizzyVerse. 
                                Please log in to your parent dashboard for more details.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        return {
            success: true,
            emailId: info.messageId,
            response: info.response
        };
    } catch (error) {
        console.error('Email sending error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Create parent notification for low quiz score
export const createParentNotification = async (req, res) => {
    try {
        const { studentId, quizResult } = req.body;

        if (!studentId || !quizResult) {
            return res.status(400).json({ message: 'Student ID and quiz result are required' });
        }

        // Check if notification already exists for this quiz
        const existingNotification = await ParentNotification.findOne({
            student: studentId,
            'quiz.quizId': quizResult.quizId
        });

        if (existingNotification) {
            return res.status(400).json({ message: 'Notification already exists for this quiz' });
        }

        // Create notification using static method
        const notification = await ParentNotification.createFromQuizResult(studentId, quizResult);
        
        if (!notification) {
            return res.status(200).json({ message: 'No notification needed - score is above threshold' });
        }

        // Populate student and parent information
        await notification.populate([
            { path: 'student', select: 'name email studentInfo' },
            { path: 'parent', select: 'name email' }
        ]);

        // Send email notification
        const emailResult = await sendEmailNotification(notification);
        
        // Update notification with email status
        notification.emailDetails.emailStatus = emailResult.success ? 'sent' : 'failed';
        notification.emailDetails.sentAt = new Date();
        notification.emailDetails.emailId = emailResult.emailId;
        notification.emailDetails.failureReason = emailResult.error;
        
        await notification.save();

        res.status(201).json({
            message: 'Parent notification created and email sent successfully',
            notification,
            emailSent: emailResult.success
        });
    } catch (error) {
        console.error('Create parent notification error:', error);
        res.status(500).json({ message: 'Failed to create parent notification', error: error.message });
    }
};

// Get parent notifications for a specific parent
export const getParentNotifications = async (req, res) => {
    try {
        const parentId = req.userId;
        const { page = 1, limit = 10, acknowledged } = req.query;

        // Verify user is a parent
        const user = await User.findById(parentId);
        if (user.role !== 'parent') {
            return res.status(403).json({ message: 'Access denied - parent role required' });
        }

        const query = { parent: parentId, isActive: true };
        if (acknowledged !== undefined) {
            query['parentResponse.acknowledged'] = acknowledged === 'true';
        }

        const notifications = await ParentNotification.find(query)
            .populate('student', 'name profilePicture')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await ParentNotification.countDocuments(query);

        res.json({
            message: 'Parent notifications retrieved successfully',
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get parent notifications error:', error);
        res.status(500).json({ message: 'Failed to get parent notifications', error: error.message });
    }
};

// Get notifications for a specific student (for parents and admins)
export const getStudentNotifications = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Verify access permissions
        const user = await User.findById(req.userId);
        if (user.role === 'parent') {
            // Check if this is the parent's child
            const student = await User.findById(studentId);
            if (!student || student.studentInfo.parentEmail !== user.email) {
                return res.status(403).json({ message: 'Access denied - not your child' });
            }
        } else if (!['admin', 'teacher'].includes(user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const notifications = await ParentNotification.find({ 
            student: studentId, 
            isActive: true 
        })
            .populate('parent', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await ParentNotification.countDocuments({ student: studentId, isActive: true });

        res.json({
            message: 'Student notifications retrieved successfully',
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get student notifications error:', error);
        res.status(500).json({ message: 'Failed to get student notifications', error: error.message });
    }
};

// Acknowledge parent notification
export const acknowledgeNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { response, requestMeeting } = req.body;
        const parentId = req.userId;

        const notification = await ParentNotification.findOne({
            _id: id,
            parent: parentId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.parentResponse.acknowledged = true;
        notification.parentResponse.acknowledgedAt = new Date();
        notification.parentResponse.response = response;
        notification.parentResponse.requestMeeting = requestMeeting || false;

        await notification.save();

        res.json({
            message: 'Notification acknowledged successfully',
            notification
        });
    } catch (error) {
        console.error('Acknowledge notification error:', error);
        res.status(500).json({ message: 'Failed to acknowledge notification', error: error.message });
    }
};

// Retry failed email notification
export const retryEmailNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await ParentNotification.findById(id)
            .populate([
                { path: 'student', select: 'name email studentInfo' },
                { path: 'parent', select: 'name email' }
            ]);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.emailDetails.retryCount >= notification.emailDetails.maxRetries) {
            return res.status(400).json({ message: 'Maximum retry attempts reached' });
        }

        // Send email notification
        const emailResult = await sendEmailNotification(notification);
        
        // Update notification with email status
        notification.emailDetails.emailStatus = emailResult.success ? 'sent' : 'failed';
        notification.emailDetails.sentAt = new Date();
        notification.emailDetails.emailId = emailResult.emailId;
        notification.emailDetails.failureReason = emailResult.error;
        notification.emailDetails.retryCount += 1;
        
        await notification.save();

        res.json({
            message: 'Email notification retry completed',
            success: emailResult.success,
            retryCount: notification.emailDetails.retryCount
        });
    } catch (error) {
        console.error('Retry email notification error:', error);
        res.status(500).json({ message: 'Failed to retry email notification', error: error.message });
    }
};
