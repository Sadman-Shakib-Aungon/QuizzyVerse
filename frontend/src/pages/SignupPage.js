import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import axios from 'axios';

const SignupPage = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:1566/api';

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Create new user data
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        isNewUser: true,
        hasActivity: false, // New users have NO activity
        createdAt: new Date().toISOString(),
        quizzesTaken: 0,
        coursesEnrolled: 0,
        hoursStudied: 0,
        averageScore: 0,
        activityHistory: [] // Empty activity history for new users
      };

      // Store in registered users list
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      // Check if user already exists
      const userExists = existingUsers.find(user => user.email === formData.email);
      if (userExists) {
        setError('An account with this email already exists');
        setLoading(false);
        return;
      }

      existingUsers.push(userData);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

      // Try API registration as well (if backend is available)
      try {
        const response = await axios.post(`${API_BASE}/auth/register`, {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        const { token, user } = response.data;
        onSignup(user, token);
      } catch (apiError) {
        // If API fails, use localStorage data
        onSignup(userData);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8" style={{
      background: 'linear-gradient(45deg, #00d2ff, #3a7bd5, #f093fb, #f5576c, #4facfe, #00f2fe, #43e97b, #38f9d7)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 10s ease infinite'
    }}>
      {/* Ultra Vibrant Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 rounded-full opacity-25 animate-bounce"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-20 animate-spin"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full opacity-25 animate-ping"></div>
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 rounded-full opacity-20 animate-bounce"></div>

        {/* Rainbow Floating Particles */}
        <div className="absolute top-16 left-16 w-5 h-5 bg-red-400 rounded-full animate-ping"></div>
        <div className="absolute top-32 right-32 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
        <div className="absolute top-48 left-48 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-48 right-48 w-3 h-3 bg-green-400 rounded-full animate-spin"></div>
        <div className="absolute bottom-32 left-32 w-7 h-7 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-16 right-16 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute top-64 right-64 w-5 h-5 bg-pink-400 rounded-full animate-bounce"></div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Join QuizzyVerse! 🎉
          </h2>
          <p className="text-gray-700 text-lg">
            🌟 Create your account and start your learning adventure! 🚀
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
              >
                🎯 Sign in here! 🎯
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="text-center relative z-10">
          <div className="flex justify-center space-x-4 text-2xl">
            <span className="animate-bounce">🎓</span>
            <span className="animate-pulse">📚</span>
            <span className="animate-bounce delay-100">🌈</span>
            <span className="animate-pulse delay-200">⭐</span>
            <span className="animate-bounce delay-300">🎊</span>
          </div>
          <p className="text-gray-600 mt-2 text-sm">
            Ready to unlock your potential? Let's get started! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;