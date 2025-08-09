import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './components/Dashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import NotificationBar from './components/NotificationBar';
import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Check for user in localStorage first (for demo purposes)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }

    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      // For demo purposes, we'll use localStorage instead of API
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } else {
        // Fallback to API if available
        const response = await axios.get(`http://localhost:1566/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, authToken = null) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('token', authToken);
    }
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setShowNotifications(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QuizzyVerse...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              !user ? (
                <LoginPage onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !user ? (
                <SignupPage onSignup={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === 'teacher' ? (
                  <TeacherDashboard
                    user={user}
                    onNotificationClick={() => setShowNotifications(true)}
                    onLogout={handleLogout}
                  />
                ) : (
                  <StudentDashboard
                    user={user}
                    onNotificationClick={() => setShowNotifications(true)}
                    onLogout={handleLogout}
                  />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>

        {/* Notification Bar */}
        {user && showNotifications && (
          <NotificationBar
            userId={user.email}
            token={token}
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
