import mongoose from 'mongoose';

// Feature 14: Parent Notification System for Low Marks
const parentNotificationSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    parent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    quiz: {
        quizId: { type: mongoose.Schema.Types.ObjectId, required: true },
        title: { type: String, required: true },
        subject: { type: String, required: true },
        totalMarks: { type: Number, required: true },
        passingMarks: { type: Number, required: true }
    },
    score: {
        obtained: { type: Number, required: true },
        percentage: { type: Number, required: true },
        grade: String
    },
    notificationType: {
        type: String,
        enum: ['low_score', 'failing_grade', 'improvement_needed', 'critical_performance'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    message: {
        subject: { type: String, required: true },
        body: { type: String, required: true },
        recommendations: [String]
    },
    emailDetails: {
        sentAt: Date,
        emailStatus: {
            type: String,
            enum: ['pending', 'sent', 'failed', 'bounced'],
            default: 'pending'
        },
        emailId: String,
        failureReason: String,
        retryCount: { type: Number, default: 0 },
        maxRetries: { type: Number, default: 3 }
    },
    parentResponse: {
        acknowledged: { type: Boolean, default: false },
        acknowledgedAt: Date,
        response: String,
        requestMeeting: { type: Boolean, default: false },
        meetingScheduled: Date
    },
    followUpActions: [{
        action: String,
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        dueDate: Date,
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'cancelled'],
            default: 'pending'
        },
        completedAt: Date,
        notes: String
    }],
    relatedConsultation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consultation' 
    },
    isActive: { type: Boolean, default: true },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    }
}, {
    timestamps: true
});

// Indexes for better performance
parentNotificationSchema.index({ student: 1, createdAt: -1 });
parentNotificationSchema.index({ parent: 1, createdAt: -1 });
parentNotificationSchema.index({ 'emailDetails.emailStatus': 1 });
parentNotificationSchema.index({ 'parentResponse.acknowledged': 1 });

// Static method to create notification based on quiz score
parentNotificationSchema.statics.createFromQuizResult = async function(studentId, quizResult) {
    const User = mongoose.model('User');
    const student = await User.findById(studentId).populate('parentInfo.children');
    
    if (!student || !student.studentInfo.parentEmail) {
        throw new Error('Student or parent information not found');
    }

    const parent = await User.findOne({ email: student.studentInfo.parentEmail });
    if (!parent) {
        throw new Error('Parent not found');
    }

    const percentage = (quizResult.score / quizResult.totalMarks) * 100;
    let notificationType, severity, grade;

    if (percentage < 40) {
        notificationType = 'critical_performance';
        severity = 'critical';
        grade = 'F';
    } else if (percentage < 50) {
        notificationType = 'failing_grade';
        severity = 'high';
        grade = 'D';
    } else if (percentage < 60) {
        notificationType = 'low_score';
        severity = 'medium';
        grade = 'C-';
    } else {
        return null; // No notification needed for passing grades
    }

    const recommendations = [
        'Schedule additional study time for this subject',
        'Consider seeking help from a tutor or consultant',
        'Review the quiz material and practice similar questions',
        'Discuss study strategies with the teacher'
    ];

    return this.create({
        student: studentId,
        parent: parent._id,
        quiz: {
            quizId: quizResult.quizId,
            title: quizResult.title,
            subject: quizResult.subject,
            totalMarks: quizResult.totalMarks,
            passingMarks: quizResult.passingMarks || Math.ceil(quizResult.totalMarks * 0.6)
        },
        score: {
            obtained: quizResult.score,
            percentage: percentage,
            grade: grade
        },
        notificationType,
        severity,
        message: {
            subject: `Low Score Alert: ${student.name} - ${quizResult.subject} Quiz`,
            body: `Dear Parent, your child ${student.name} has scored ${quizResult.score}/${quizResult.totalMarks} (${percentage.toFixed(1)}%) in the ${quizResult.subject} quiz titled "${quizResult.title}". This performance requires attention and support.`,
            recommendations
        }
    });
};

export default mongoose.model('ParentNotification', parentNotificationSchema);
