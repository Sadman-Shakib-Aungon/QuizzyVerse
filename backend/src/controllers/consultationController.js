import Consultation from '../models/Consultation.js';
import User from '../models/User.js';

// Feature 15: Student Consultation System for Low Marks

// Create consultation request (automatically or manually)
export const createConsultation = async (req, res) => {
    try {
        const { studentId, consultantId, quizResult, consultationType, topics, studentNotes } = req.body;

        if (!studentId || !quizResult) {
            return res.status(400).json({ message: 'Student ID and quiz result are required' });
        }

        let consultation;

        if (consultantId) {
            // Manual assignment
            const consultant = await User.findById(consultantId);
            if (!consultant || consultant.role !== 'consultant') {
                return res.status(400).json({ message: 'Invalid consultant ID' });
            }

            consultation = new Consultation({
                student: studentId,
                consultant: consultantId,
                triggerQuiz: {
                    quizId: quizResult.quizId,
                    title: quizResult.title,
                    subject: quizResult.subject,
                    score: quizResult.score,
                    totalMarks: quizResult.totalMarks,
                    percentage: (quizResult.score / quizResult.totalMarks) * 100
                },
                consultationType: consultationType || 'academic_support',
                automaticallyAssigned: false,
                assignmentReason: 'Manually assigned by admin/teacher'
            });
        } else {
            // Automatic assignment
            consultation = await Consultation.autoAssignConsultant(studentId, quizResult);
        }

        if (topics) {
            consultation.topics = topics;
        }

        if (studentNotes) {
            consultation.studentNotes = studentNotes;
        }

        await consultation.save();
        await consultation.populate([
            { path: 'student', select: 'name email studentInfo' },
            { path: 'consultant', select: 'name email consultantInfo' }
        ]);

        res.status(201).json({
            message: 'Consultation created successfully',
            consultation
        });
    } catch (error) {
        console.error('Create consultation error:', error);
        res.status(500).json({ message: 'Failed to create consultation', error: error.message });
    }
};

// Get consultations for a student
export const getStudentConsultations = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        // Verify access permissions
        const user = await User.findById(req.userId);
        if (user.role === 'student' && user._id.toString() !== studentId) {
            return res.status(403).json({ message: 'Access denied - can only view your own consultations' });
        } else if (user.role === 'parent') {
            const student = await User.findById(studentId);
            if (!student || student.studentInfo.parentEmail !== user.email) {
                return res.status(403).json({ message: 'Access denied - not your child' });
            }
        } else if (!['admin', 'teacher'].includes(user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const query = { student: studentId, isActive: true };
        if (status) query.status = status;

        const consultations = await Consultation.find(query)
            .populate('consultant', 'name email consultantInfo')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Consultation.countDocuments(query);

        res.json({
            message: 'Student consultations retrieved successfully',
            consultations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get student consultations error:', error);
        res.status(500).json({ message: 'Failed to get student consultations', error: error.message });
    }
};

// Get consultations for a consultant
export const getConsultantConsultations = async (req, res) => {
    try {
        const consultantId = req.userId;
        const { page = 1, limit = 10, status } = req.query;

        // Verify user is a consultant
        const user = await User.findById(consultantId);
        if (user.role !== 'consultant') {
            return res.status(403).json({ message: 'Access denied - consultant role required' });
        }

        const query = { consultant: consultantId, isActive: true };
        if (status) query.status = status;

        const consultations = await Consultation.find(query)
            .populate('student', 'name email studentInfo')
            .sort({ scheduledDateTime: 1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Consultation.countDocuments(query);

        res.json({
            message: 'Consultant consultations retrieved successfully',
            consultations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get consultant consultations error:', error);
        res.status(500).json({ message: 'Failed to get consultant consultations', error: error.message });
    }
};

// Schedule consultation
export const scheduleConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledDateTime, duration, meetingDetails } = req.body;

        const consultation = await Consultation.findById(id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        if (!consultation.canBeScheduled()) {
            return res.status(400).json({ message: 'Consultation cannot be scheduled in current status' });
        }

        // Verify user can schedule this consultation
        const user = await User.findById(req.userId);
        const canSchedule = user.role === 'admin' || 
                           user._id.toString() === consultation.consultant.toString() ||
                           user._id.toString() === consultation.student.toString();

        if (!canSchedule) {
            return res.status(403).json({ message: 'Access denied' });
        }

        consultation.scheduledDateTime = new Date(scheduledDateTime);
        consultation.duration = duration || 30;
        consultation.status = 'scheduled';
        
        if (meetingDetails) {
            consultation.meetingDetails = { ...consultation.meetingDetails, ...meetingDetails };
        }

        await consultation.save();
        await consultation.populate([
            { path: 'student', select: 'name email' },
            { path: 'consultant', select: 'name email' }
        ]);

        res.json({
            message: 'Consultation scheduled successfully',
            consultation
        });
    } catch (error) {
        console.error('Schedule consultation error:', error);
        res.status(500).json({ message: 'Failed to schedule consultation', error: error.message });
    }
};

// Update consultation status
export const updateConsultationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, sessionData } = req.body;

        const consultation = await Consultation.findById(id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        // Verify user can update this consultation
        const user = await User.findById(req.userId);
        const canUpdate = user.role === 'admin' || 
                         user._id.toString() === consultation.consultant.toString();

        if (!canUpdate) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (status === 'completed') {
            await consultation.markCompleted(sessionData);
        } else {
            consultation.status = status;
            await consultation.save();
        }

        await consultation.populate([
            { path: 'student', select: 'name email' },
            { path: 'consultant', select: 'name email' }
        ]);

        res.json({
            message: 'Consultation status updated successfully',
            consultation
        });
    } catch (error) {
        console.error('Update consultation status error:', error);
        res.status(500).json({ message: 'Failed to update consultation status', error: error.message });
    }
};

// Add feedback to consultation
export const addConsultationFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, feedback, improvementSuggestions } = req.body;

        const consultation = await Consultation.findById(id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        const user = await User.findById(req.userId);
        
        if (user._id.toString() === consultation.student.toString()) {
            // Student feedback
            consultation.feedback.studentRating = rating;
            consultation.feedback.studentFeedback = feedback;
        } else if (user._id.toString() === consultation.consultant.toString()) {
            // Consultant feedback
            consultation.feedback.consultantRating = rating;
            consultation.feedback.consultantFeedback = feedback;
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (improvementSuggestions) {
            consultation.feedback.improvementSuggestions = improvementSuggestions;
        }

        await consultation.save();

        // Update consultant rating if student provided feedback
        if (user._id.toString() === consultation.student.toString() && rating) {
            const consultant = await User.findById(consultation.consultant);
            const consultantConsultations = await Consultation.find({
                consultant: consultation.consultant,
                'feedback.studentRating': { $exists: true, $ne: null }
            });

            const totalRating = consultantConsultations.reduce((sum, c) => sum + c.feedback.studentRating, 0);
            const avgRating = totalRating / consultantConsultations.length;

            consultant.consultantInfo.rating = avgRating;
            await consultant.save();
        }

        res.json({
            message: 'Feedback added successfully',
            consultation
        });
    } catch (error) {
        console.error('Add consultation feedback error:', error);
        res.status(500).json({ message: 'Failed to add feedback', error: error.message });
    }
};

// Get available consultants for a subject
export const getAvailableConsultants = async (req, res) => {
    try {
        const { subject } = req.params;

        const consultants = await User.find({
            role: 'consultant',
            'consultantInfo.subjects': subject,
            isActive: true
        })
        .select('name email consultantInfo')
        .sort({ 'consultantInfo.rating': -1, 'consultantInfo.totalConsultations': 1 });

        res.json({
            message: 'Available consultants retrieved successfully',
            consultants
        });
    } catch (error) {
        console.error('Get available consultants error:', error);
        res.status(500).json({ message: 'Failed to get available consultants', error: error.message });
    }
};

// Get consultation by ID
export const getConsultationById = async (req, res) => {
    try {
        const { id } = req.params;

        const consultation = await Consultation.findById(id)
            .populate('student', 'name email studentInfo')
            .populate('consultant', 'name email consultantInfo');

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        // Verify access permissions
        const user = await User.findById(req.userId);
        const hasAccess = user.role === 'admin' ||
                         user._id.toString() === consultation.student.toString() ||
                         user._id.toString() === consultation.consultant.toString();

        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({
            message: 'Consultation retrieved successfully',
            consultation
        });
    } catch (error) {
        console.error('Get consultation by ID error:', error);
        res.status(500).json({ message: 'Failed to get consultation', error: error.message });
    }
};
