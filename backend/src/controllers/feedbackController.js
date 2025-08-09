import LearningFeedback from '../models/LearningFeedback.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Feature 8: Student Learning Feedback System

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/feedback/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|ppt|pptx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and documents are allowed'));
        }
    }
});

// Create new learning feedback
export const createFeedback = async (req, res) => {
    try {
        const { title, content, subject, category, tags, classCode } = req.body;
        const author = req.userId;

        // Verify user is a student and has access to the class
        const user = await User.findById(author);
        if (user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can create learning feedback' });
        }

        if (user.studentInfo.classCode !== classCode) {
            return res.status(403).json({ message: 'You can only post feedback in your assigned class' });
        }

        // Handle file attachments
        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        const feedback = new LearningFeedback({
            title,
            content,
            author,
            classCode,
            subject,
            category: category || 'study_technique',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            attachments
        });

        await feedback.save();
        await feedback.populate('author', 'name profilePicture');

        res.status(201).json({
            message: 'Learning feedback created successfully',
            feedback
        });
    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({ message: 'Failed to create feedback', error: error.message });
    }
};

// Get feedback for a specific class
export const getClassFeedback = async (req, res) => {
    try {
        const { classCode } = req.params;
        const { page = 1, limit = 10, subject, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Verify user has access to this class
        const user = await User.findById(req.userId);
        if (user.role === 'student' && user.studentInfo.classCode !== classCode) {
            return res.status(403).json({ message: 'Access denied to this class' });
        }

        // Build query
        const query = { classCode, isActive: true };
        if (subject) query.subject = subject;
        if (category) query.category = category;

        // Only show approved feedback to students, all feedback to teachers/admins
        if (user.role === 'student') {
            query.isApproved = true;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const feedbacks = await LearningFeedback.find(query)
            .populate('author', 'name profilePicture')
            .populate('comments.author', 'name profilePicture')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await LearningFeedback.countDocuments(query);

        res.json({
            message: 'Feedback retrieved successfully',
            feedbacks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get class feedback error:', error);
        res.status(500).json({ message: 'Failed to get feedback', error: error.message });
    }
};

// Get single feedback by ID
export const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await LearningFeedback.findById(id)
            .populate('author', 'name profilePicture')
            .populate('comments.author', 'name profilePicture');

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Verify user has access to this feedback
        const user = await User.findById(req.userId);
        if (user.role === 'student' && user.studentInfo.classCode !== feedback.classCode) {
            return res.status(403).json({ message: 'Access denied to this feedback' });
        }

        // Increment view count
        feedback.views += 1;
        await feedback.save();

        res.json({
            message: 'Feedback retrieved successfully',
            feedback
        });
    } catch (error) {
        console.error('Get feedback by ID error:', error);
        res.status(500).json({ message: 'Failed to get feedback', error: error.message });
    }
};

// Like/Unlike feedback
export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const feedback = await LearningFeedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Verify user has access to this feedback
        const user = await User.findById(userId);
        if (user.role === 'student' && user.studentInfo.classCode !== feedback.classCode) {
            return res.status(403).json({ message: 'Access denied to this feedback' });
        }

        const isLiked = feedback.isLikedBy(userId);
        
        if (isLiked) {
            feedback.removeLike(userId);
        } else {
            feedback.addLike(userId);
        }

        await feedback.save();

        res.json({
            message: isLiked ? 'Like removed' : 'Like added',
            isLiked: !isLiked,
            likeCount: feedback.likeCount
        });
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({ message: 'Failed to toggle like', error: error.message });
    }
};

// Add comment to feedback
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const author = req.userId;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const feedback = await LearningFeedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Verify user has access to this feedback
        const user = await User.findById(author);
        if (user.role === 'student' && user.studentInfo.classCode !== feedback.classCode) {
            return res.status(403).json({ message: 'Access denied to this feedback' });
        }

        const comment = {
            author,
            content: content.trim()
        };

        feedback.comments.push(comment);
        await feedback.save();
        
        await feedback.populate('comments.author', 'name profilePicture');

        res.status(201).json({
            message: 'Comment added successfully',
            comment: feedback.comments[feedback.comments.length - 1]
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
};

// Update feedback (only by author or admin)
export const updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, tags } = req.body;
        const userId = req.userId;

        const feedback = await LearningFeedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        const user = await User.findById(userId);
        
        // Only author or admin can update
        if (feedback.author.toString() !== userId.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Update fields
        if (title) feedback.title = title;
        if (content) feedback.content = content;
        if (category) feedback.category = category;
        if (tags) feedback.tags = tags.split(',').map(tag => tag.trim());

        // Reset approval if content changed (except for admin)
        if ((title || content) && user.role !== 'admin') {
            feedback.isApproved = false;
            feedback.approvedBy = undefined;
            feedback.approvedAt = undefined;
        }

        await feedback.save();
        await feedback.populate('author', 'name profilePicture');

        res.json({
            message: 'Feedback updated successfully',
            feedback
        });
    } catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({ message: 'Failed to update feedback', error: error.message });
    }
};

// Delete feedback (only by author or admin)
export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const feedback = await LearningFeedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        const user = await User.findById(userId);
        
        // Only author or admin can delete
        if (feedback.author.toString() !== userId.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Soft delete
        feedback.isActive = false;
        await feedback.save();

        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ message: 'Failed to delete feedback', error: error.message });
    }
};

// Approve feedback (admin/teacher only)
export const approveFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!['admin', 'teacher'].includes(user.role)) {
            return res.status(403).json({ message: 'Only admins and teachers can approve feedback' });
        }

        const feedback = await LearningFeedback.findByIdAndUpdate(
            id,
            {
                isApproved: true,
                approvedBy: userId,
                approvedAt: new Date()
            },
            { new: true }
        ).populate('author', 'name profilePicture');

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.json({
            message: 'Feedback approved successfully',
            feedback
        });
    } catch (error) {
        console.error('Approve feedback error:', error);
        res.status(500).json({ message: 'Failed to approve feedback', error: error.message });
    }
};

// Get user's own feedback
export const getMyFeedback = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const author = req.userId;

        const feedbacks = await LearningFeedback.find({ author, isActive: true })
            .populate('author', 'name profilePicture')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await LearningFeedback.countDocuments({ author, isActive: true });

        res.json({
            message: 'Your feedback retrieved successfully',
            feedbacks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get my feedback error:', error);
        res.status(500).json({ message: 'Failed to get your feedback', error: error.message });
    }
};

export { upload };
