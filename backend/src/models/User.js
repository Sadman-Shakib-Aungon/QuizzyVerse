import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    contactDetails: {
        phone: String,
        address: String,
        emergencyContact: String
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'parent', 'consultant'],
        default: 'student'
    },
    // Enhanced preferences for Feature 3
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            quizReminders: { type: Boolean, default: true },
            scoreUpdates: { type: Boolean, default: true },
            parentNotifications: { type: Boolean, default: true }
        },
        theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
        language: { type: String, default: 'en' },
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
            shareProgress: { type: Boolean, default: true },
            allowFeedback: { type: Boolean, default: true }
        },
        accessibility: {
            fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
            highContrast: { type: Boolean, default: false },
            screenReader: { type: Boolean, default: false }
        }
    },
    // Student-specific fields
    studentInfo: {
        classCode: String,
        grade: String,
        parentEmail: String,
        subjects: [String],
        weakAreas: [String] // For consultation system
    },
    // Parent-specific fields
    parentInfo: {
        children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    // Consultant-specific fields
    consultantInfo: {
        subjects: [String],
        qualifications: [String],
        availability: [{
            day: String,
            startTime: String,
            endTime: String
        }],
        rating: { type: Number, default: 0 },
        totalConsultations: { type: Number, default: 0 }
    },
    activityHistory: [{
        quizId: mongoose.Schema.Types.ObjectId,
        score: Number,
        takenAt: { type: Date, default: Date.now },
        subject: String
    }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

export default mongoose.model('User', userSchema);