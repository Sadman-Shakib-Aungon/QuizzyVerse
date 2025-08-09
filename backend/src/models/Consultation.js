import mongoose from 'mongoose';

// Feature 15: Student Consultation System for Low Marks
const consultationSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    consultant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    triggerQuiz: {
        quizId: { type: mongoose.Schema.Types.ObjectId, required: true },
        title: String,
        subject: { type: String, required: true },
        score: Number,
        totalMarks: Number,
        percentage: Number
    },
    consultationType: {
        type: String,
        enum: ['academic_support', 'study_strategy', 'exam_preparation', 'subject_clarification', 'motivation'],
        default: 'academic_support'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['requested', 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
        default: 'requested'
    },
    scheduledDateTime: Date,
    duration: { 
        type: Number, 
        default: 30 // minutes
    },
    meetingDetails: {
        platform: {
            type: String,
            enum: ['zoom', 'google_meet', 'teams', 'in_person', 'phone'],
            default: 'zoom'
        },
        meetingLink: String,
        meetingId: String,
        location: String, // for in-person meetings
        phoneNumber: String // for phone consultations
    },
    topics: [{
        topic: String,
        description: String,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        }
    }],
    studentNotes: {
        beforeConsultation: String,
        specificQuestions: [String],
        learningGoals: [String]
    },
    consultantNotes: {
        preparation: String,
        sessionNotes: String,
        recommendations: [String],
        followUpActions: [String],
        nextSteps: String
    },
    sessionSummary: {
        topicsCovered: [String],
        keyInsights: [String],
        homeworkAssigned: [String],
        resourcesShared: [{
            title: String,
            type: {
                type: String,
                enum: ['document', 'video', 'website', 'book', 'practice_test']
            },
            url: String,
            description: String
        }]
    },
    feedback: {
        studentRating: {
            type: Number,
            min: 1,
            max: 5
        },
        studentFeedback: String,
        consultantRating: {
            type: Number,
            min: 1,
            max: 5
        },
        consultantFeedback: String,
        improvementSuggestions: [String]
    },
    followUp: {
        nextConsultationDate: Date,
        progressCheckDate: Date,
        parentNotificationSent: { type: Boolean, default: false },
        teacherNotificationSent: { type: Boolean, default: false }
    },
    automaticallyAssigned: { type: Boolean, default: true },
    assignmentReason: String,
    cost: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' },
        paymentStatus: {
            type: String,
            enum: ['free', 'pending', 'paid', 'refunded'],
            default: 'free'
        }
    },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Indexes for better performance
consultationSchema.index({ student: 1, createdAt: -1 });
consultationSchema.index({ consultant: 1, scheduledDateTime: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ 'triggerQuiz.subject': 1 });

// Static method to automatically assign consultant based on subject and availability
consultationSchema.statics.autoAssignConsultant = async function(studentId, quizResult) {
    const User = mongoose.model('User');
    
    // Find available consultants for the subject
    const consultants = await User.find({
        role: 'consultant',
        'consultantInfo.subjects': quizResult.subject,
        isActive: true
    }).sort({ 'consultantInfo.rating': -1, 'consultantInfo.totalConsultations': 1 });

    if (consultants.length === 0) {
        throw new Error(`No consultants available for ${quizResult.subject}`);
    }

    // Simple round-robin assignment (can be enhanced with more sophisticated logic)
    const selectedConsultant = consultants[0];

    const percentage = (quizResult.score / quizResult.totalMarks) * 100;
    let priority = 'medium';
    let consultationType = 'academic_support';

    if (percentage < 40) {
        priority = 'urgent';
        consultationType = 'exam_preparation';
    } else if (percentage < 50) {
        priority = 'high';
        consultationType = 'study_strategy';
    }

    return this.create({
        student: studentId,
        consultant: selectedConsultant._id,
        triggerQuiz: {
            quizId: quizResult.quizId,
            title: quizResult.title,
            subject: quizResult.subject,
            score: quizResult.score,
            totalMarks: quizResult.totalMarks,
            percentage: percentage
        },
        consultationType,
        priority,
        automaticallyAssigned: true,
        assignmentReason: `Auto-assigned due to low score (${percentage.toFixed(1)}%) in ${quizResult.subject}`
    });
};

// Method to check if consultation can be scheduled
consultationSchema.methods.canBeScheduled = function() {
    return ['requested', 'cancelled'].includes(this.status);
};

// Method to mark consultation as completed
consultationSchema.methods.markCompleted = async function(sessionData) {
    this.status = 'completed';
    if (sessionData) {
        this.consultantNotes = { ...this.consultantNotes, ...sessionData.consultantNotes };
        this.sessionSummary = { ...this.sessionSummary, ...sessionData.sessionSummary };
    }
    
    // Update consultant's total consultations
    await mongoose.model('User').findByIdAndUpdate(
        this.consultant,
        { $inc: { 'consultantInfo.totalConsultations': 1 } }
    );
    
    return this.save();
};

export default mongoose.model('Consultation', consultationSchema);
