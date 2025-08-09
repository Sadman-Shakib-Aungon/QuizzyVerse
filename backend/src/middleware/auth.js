import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid token or user not found' });
        }

        req.userId = user._id;
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
};

// Check if user has required role
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${roles.join(' or ')}` 
            });
        }

        next();
    };
};

// Check if user is student
export const requireStudent = requireRole('student');

// Check if user is teacher
export const requireTeacher = requireRole('teacher');

// Check if user is admin
export const requireAdmin = requireRole('admin');

// Check if user is parent
export const requireParent = requireRole('parent');

// Check if user is consultant
export const requireConsultant = requireRole('consultant');

// Check if user is teacher or admin
export const requireTeacherOrAdmin = requireRole('teacher', 'admin');

// Check if user is student or parent (for accessing student data)
export const requireStudentOrParent = requireRole('student', 'parent');

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.isActive) {
                req.userId = user._id;
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};

// Check if user can access specific student data
export const canAccessStudentData = async (req, res, next) => {
    try {
        const studentId = req.params.studentId || req.params.id;
        
        // Admin can access any student data
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Student can access their own data
        if (req.user.role === 'student' && req.user._id.toString() === studentId) {
            return next();
        }
        
        // Parent can access their child's data
        if (req.user.role === 'parent') {
            const student = await User.findById(studentId);
            if (student && student.studentInfo.parentEmail === req.user.email) {
                return next();
            }
        }
        
        // Teacher can access students in their class (this would need class management)
        if (req.user.role === 'teacher') {
            // For now, allow teachers to access any student data
            // In a real implementation, you'd check if the student is in the teacher's class
            return next();
        }
        
        return res.status(403).json({ message: 'Access denied to student data' });
    } catch (error) {
        console.error('Access control error:', error);
        res.status(500).json({ message: 'Access control failed', error: error.message });
    }
};
