import mongoose from 'mongoose';

// Feature 8: Student Learning Feedback System
const learningFeedbackSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        maxlength: 200
    },
    content: { 
        type: String, 
        required: true,
        maxlength: 2000
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    classCode: { 
        type: String, 
        required: true,
        index: true
    },
    subject: { 
        type: String, 
        required: true 
    },
    category: {
        type: String,
        enum: ['study_technique', 'exam_strategy', 'time_management', 'resource_sharing', 'motivation', 'other'],
        default: 'study_technique'
    },
    tags: [String],
    attachments: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadDate: { type: Date, default: Date.now }
    }],
    likes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        likedAt: { type: Date, default: Date.now }
    }],
    comments: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    views: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reportCount: { type: Number, default: 0 },
    reports: [{
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        reportedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes for better performance
learningFeedbackSchema.index({ classCode: 1, subject: 1 });
learningFeedbackSchema.index({ author: 1 });
learningFeedbackSchema.index({ createdAt: -1 });
learningFeedbackSchema.index({ likes: 1 });

// Virtual for like count
learningFeedbackSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for comment count
learningFeedbackSchema.virtual('commentCount').get(function() {
    return this.comments.length;
});

// Method to check if user has liked the feedback
learningFeedbackSchema.methods.isLikedBy = function(userId) {
    return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to add a like
learningFeedbackSchema.methods.addLike = function(userId) {
    if (!this.isLikedBy(userId)) {
        this.likes.push({ user: userId });
    }
};

// Method to remove a like
learningFeedbackSchema.methods.removeLike = function(userId) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
};

// Ensure virtuals are included in JSON
learningFeedbackSchema.set('toJSON', { virtuals: true });

export default mongoose.model('LearningFeedback', learningFeedbackSchema);
