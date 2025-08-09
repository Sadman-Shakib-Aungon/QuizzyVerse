import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Lock, Eye, EyeOff, LogIn, GraduationCap, Users, TrendingUp, Shield, Star, Award, Zap } from 'lucide-react';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const extractNameFromEmail = (email) => {
    const localPart = email.split('@')[0];
    const cleanName = localPart.replace(/[._]/g, ' ');
    return cleanName.replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First try to find user in registered users (localStorage)
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUser = registeredUsers.find(user => user.email === formData.email);

      if (existingUser) {
        // User found in localStorage - simulate successful login
        const userData = {
          ...existingUser,
          loginAt: new Date().toISOString()
        };

        onLogin(userData);
        return;
      }

      // If not found in localStorage, try API
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, formData);
        const { token, user } = response.data;
        onLogin(user, token);
      } catch (apiError) {
        // If API fails, create a demo user based on email
        const fullName = extractNameFromEmail(formData.email);
        const nameParts = fullName.split(' ');

        const demoUser = {
          email: formData.email,
          firstName: nameParts[0] || 'User',
          lastName: nameParts[1] || 'Demo',
          role: formData.email.includes('teacher') || formData.email.includes('prof') || formData.email.includes('instructor') ? 'teacher' : 'student',
          hasActivity: true, // Existing user simulation
          loginAt: new Date().toISOString(),
          quizzesTaken: Math.floor(Math.random() * 10) + 5,
          coursesEnrolled: Math.floor(Math.random() * 5) + 2,
          averageScore: Math.floor(Math.random() * 30) + 70
        };

        onLogin(demoUser);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-20">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">QuizzyVerse</h1>
                <p className="text-cyan-200 text-sm">Educational Excellence</p>
              </div>
            </div>

            {/* Hero Text */}
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Transform Your
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Learning Journey
              </span>
            </h2>

            <p className="text-xl text-gray-300 leading-relaxed mb-10">
              Join thousands of students and educators in our comprehensive learning ecosystem.
              Experience personalized education with advanced analytics and collaborative tools.
            </p>

            {/* Features */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Collaborative Learning</h3>
                  <p className="text-gray-400">Connect with peers and share knowledge</p>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Progress Tracking</h3>
                  <p className="text-gray-400">Monitor your learning with detailed analytics</p>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Secure & Reliable</h3>
                  <p className="text-gray-400">Enterprise-grade security protection</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50K+</div>
                <div className="text-cyan-300 text-sm font-medium">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">1K+</div>
                <div className="text-purple-300 text-sm font-medium">Expert Teachers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">100K+</div>
                <div className="text-pink-300 text-sm font-medium">Quizzes Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">QuizzyVerse</h1>
              <p className="text-gray-300">Educational Excellence</p>
            </div>

            {/* Login Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-white/20 to-white/10 px-8 py-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
                <p className="text-gray-300 text-center">Sign in to access your learning dashboard</p>
              </div>

              {/* Card Body */}
              <div className="px-8 py-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-200">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm hover:bg-white/20"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-white">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm hover:bg-white/20"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/10 rounded-r-2xl transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-white/30 rounded bg-white/10"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <button type="button" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-2xl text-base font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-cyan-500/25"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Signing in...
                      </div>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-3" />
                        Sign In to Dashboard
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gradient-to-r from-transparent via-white/10 to-transparent text-gray-300">
                        New to QuizzyVerse?
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="mt-6">
                  <Link
                    to="/signup"
                    className="w-full flex justify-center items-center py-4 px-6 border border-white/30 rounded-2xl shadow-lg text-base font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-all duration-300 backdrop-blur-sm hover:border-white/50"
                  >
                    Create New Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-center">
              <div className="flex justify-center items-center space-x-8 text-sm text-gray-300">
                <div className="flex items-center group">
                  <Shield className="h-5 w-5 mr-2 text-green-400 group-hover:text-green-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">Secure Login</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 group-hover:bg-green-300 transition-colors"></div>
                  <span className="group-hover:text-white transition-colors">SSL Protected</span>
                </div>
                <div className="flex items-center group">
                  <Star className="h-5 w-5 mr-2 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">Trusted Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
