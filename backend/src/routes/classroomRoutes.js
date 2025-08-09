import express from 'express';
import { authenticateToken, requireTeacherOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Test route (no auth required)
router.get('/test', (req, res) => {
    res.json({ message: 'Classroom routes working', timestamp: new Date().toISOString() });
});

// All routes require authentication
router.use(authenticateToken);

// Create classroom (teachers only)
router.post('/', requireTeacherOrAdmin, async (req, res) => {
    try {
        const { name, subject, description, classCode } = req.body;
        
        if (!name || !subject) {
            return res.status(400).json({ message: 'Name and subject are required' });
        }

        const classroom = {
            id: Date.now().toString(),
            name,
            subject,
            description: description || '',
            classCode: classCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
            teacherId: req.userId,
            students: [],
            quizzes: [],
            announcements: [],
            createdAt: new Date().toISOString()
        };

        res.status(201).json({
            message: 'Classroom created successfully',
            classroom
        });
    } catch (error) {
        console.error('Create classroom error:', error);
        res.status(500).json({ message: 'Failed to create classroom', error: error.message });
    }
});

// Get all classrooms for current user
router.get('/', async (req, res) => {
    try {
        // Mock data - in real app, fetch from database
        const classrooms = [
            {
                id: '1',
                name: 'Mathematics 101',
                subject: 'Mathematics',
                description: 'Basic mathematics course',
                classCode: 'MATH101',
                teacherId: req.userId,
                students: ['student1', 'student2'],
                quizzes: ['quiz1', 'quiz2'],
                announcements: [],
                createdAt: new Date().toISOString()
            }
        ];

        res.json({ classrooms });
    } catch (error) {
        console.error('Get classrooms error:', error);
        res.status(500).json({ message: 'Failed to fetch classrooms', error: error.message });
    }
});

// Get classroom by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Mock data - in real app, fetch from database
        const classroom = {
            id,
            name: 'Mathematics 101',
            subject: 'Mathematics',
            description: 'Basic mathematics course',
            classCode: 'MATH101',
            teacherId: req.userId,
            students: [
                { id: 'student1', name: 'John Doe', email: 'john@example.com' },
                { id: 'student2', name: 'Jane Smith', email: 'jane@example.com' }
            ],
            quizzes: [
                { id: 'quiz1', title: 'Algebra Basics', status: 'published' },
                { id: 'quiz2', title: 'Geometry Fundamentals', status: 'draft' }
            ],
            announcements: [
                { id: 'ann1', title: 'Welcome to the class', content: 'Looking forward to a great semester!', createdAt: new Date().toISOString() }
            ],
            createdAt: new Date().toISOString()
        };

        res.json({ classroom });
    } catch (error) {
        console.error('Get classroom error:', error);
        res.status(500).json({ message: 'Failed to fetch classroom', error: error.message });
    }
});

// Add student to classroom
router.post('/:id/students', requireTeacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { studentEmail, studentId } = req.body;
        
        if (!studentEmail && !studentId) {
            return res.status(400).json({ message: 'Student email or ID is required' });
        }

        res.json({
            message: 'Student added to classroom successfully',
            student: {
                id: studentId || 'generated-id',
                email: studentEmail,
                addedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ message: 'Failed to add student', error: error.message });
    }
});

// Remove student from classroom
router.delete('/:id/students/:studentId', requireTeacherOrAdmin, async (req, res) => {
    try {
        const { id, studentId } = req.params;
        
        res.json({
            message: 'Student removed from classroom successfully',
            classroomId: id,
            studentId
        });
    } catch (error) {
        console.error('Remove student error:', error);
        res.status(500).json({ message: 'Failed to remove student', error: error.message });
    }
});

// Create announcement
router.post('/:id/announcements', requireTeacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, priority } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const announcement = {
            id: Date.now().toString(),
            title,
            content,
            priority: priority || 'normal',
            classroomId: id,
            teacherId: req.userId,
            createdAt: new Date().toISOString()
        };

        res.status(201).json({
            message: 'Announcement created successfully',
            announcement
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ message: 'Failed to create announcement', error: error.message });
    }
});

// Get classroom announcements
router.get('/:id/announcements', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Mock data
        const announcements = [
            {
                id: '1',
                title: 'Welcome to Mathematics 101',
                content: 'Looking forward to a great semester! Please review the syllabus.',
                priority: 'high',
                classroomId: id,
                teacherId: req.userId,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Quiz Next Week',
                content: 'We will have a quiz on algebra next Tuesday. Please prepare chapters 1-3.',
                priority: 'normal',
                classroomId: id,
                teacherId: req.userId,
                createdAt: new Date().toISOString()
            }
        ];

        res.json({ announcements });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
    }
});

// Join classroom by code (students)
router.post('/join', async (req, res) => {
    try {
        const { classCode } = req.body;
        
        if (!classCode) {
            return res.status(400).json({ message: 'Class code is required' });
        }

        // Mock response
        const classroom = {
            id: '1',
            name: 'Mathematics 101',
            subject: 'Mathematics',
            classCode: classCode.toUpperCase(),
            teacherName: 'Prof. Johnson'
        };

        res.json({
            message: 'Successfully joined classroom',
            classroom
        });
    } catch (error) {
        console.error('Join classroom error:', error);
        res.status(500).json({ message: 'Failed to join classroom', error: error.message });
    }
});

// Update classroom
router.put('/:id', requireTeacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, subject, description } = req.body;
        
        const updatedClassroom = {
            id,
            name: name || 'Mathematics 101',
            subject: subject || 'Mathematics',
            description: description || 'Updated description',
            updatedAt: new Date().toISOString()
        };

        res.json({
            message: 'Classroom updated successfully',
            classroom: updatedClassroom
        });
    } catch (error) {
        console.error('Update classroom error:', error);
        res.status(500).json({ message: 'Failed to update classroom', error: error.message });
    }
});

// Delete classroom
router.delete('/:id', requireTeacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        res.json({
            message: 'Classroom deleted successfully',
            classroomId: id
        });
    } catch (error) {
        console.error('Delete classroom error:', error);
        res.status(500).json({ message: 'Failed to delete classroom', error: error.message });
    }
});

export default router;
