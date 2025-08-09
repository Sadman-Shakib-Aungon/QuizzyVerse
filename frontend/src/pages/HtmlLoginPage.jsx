import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HtmlLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const extractNameFromEmail = (email) => {
    const localPart = email.split('@')[0];
    const cleanName = localPart.replace(/[._]/g, ' ');
    return cleanName.replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUser = existingUsers.find(user => user.email === email);

      if (existingUser) {
        localStorage.setItem('currentUser', JSON.stringify(existingUser));
        if (existingUser.role === 'teacher') {
          navigate('/html-teacher-dashboard');
        } else {
          navigate(existingUser.hasActivity ? '/html-dashboard' : '/html-student-dashboard');
        }
      } else {
        const fullName = extractNameFromEmail(email);
        const nameParts = fullName.split(' ');
        
        const demoUser = {
          email: email,
          firstName: nameParts[0] || 'User',
          lastName: nameParts[1] || 'Demo',
          role: email.includes('teacher') || email.includes('prof') || email.includes('instructor') ? 'teacher' : 'student',
          hasActivity: true,
          loginAt: new Date().toISOString(),
          quizzesTaken: Math.floor(Math.random() * 10) + 5,
          coursesEnrolled: Math.floor(Math.random() * 5) + 2,
          averageScore: Math.floor(Math.random() * 30) + 70
        };

        localStorage.setItem('currentUser', JSON.stringify(demoUser));
        
        if (demoUser.role === 'teacher') {
          navigate('/html-teacher-dashboard');
        } else {
          navigate('/html-dashboard');
        }
      }
    }, 2000);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        .background-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 20s infinite linear;
        }

        .particle:nth-child(1) {
          width: 80px;
          height: 80px;
          left: 10%;
          animation-delay: 0s;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        }

        .particle:nth-child(2) {
          width: 60px;
          height: 60px;
          left: 20%;
          animation-delay: 2s;
          background: linear-gradient(45deg, #45b7d1, #96ceb4);
        }

        .particle:nth-child(3) {
          width: 100px;
          height: 100px;
          left: 70%;
          animation-delay: 4s;
          background: linear-gradient(45deg, #feca57, #ff9ff3);
        }

        .particle:nth-child(4) {
          width: 40px;
          height: 40px;
          left: 80%;
          animation-delay: 6s;
          background: linear-gradient(45deg, #54a0ff, #5f27cd);
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        .login-container {
          display: flex;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        .hero-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          color: white;
          position: relative;
        }

        .hero-content {
          max-width: 500px;
        }

        .logo {
          display: flex;
          align-items: center;
          margin-bottom: 40px;
        }

        .logo-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .logo-text {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #fff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 20px;
          font-weight: 400;
          line-height: 1.6;
          margin-bottom: 40px;
          color: rgba(255, 255, 255, 0.9);
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }

        .feature-text {
          font-size: 16px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }

        .login-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
          background-size: 400% 400%;
          animation: gradientShift 3s ease infinite;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-title {
          font-size: 32px;
          font-weight: 800;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 16px;
          color: #718096;
          font-weight: 500;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: #a0aec0;
          font-size: 16px;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .form-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          background: #f7fafc;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input:focus + .input-icon,
        .input-wrapper:focus-within .input-icon {
          color: #667eea;
        }

        .login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 18px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .login-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .login-button:hover::before {
          left: 100%;
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
        }

        .login-button.loading {
          pointer-events: none;
          opacity: 0.8;
        }

        .divider {
          position: relative;
          text-align: center;
          margin: 32px 0 24px 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e2e8f0;
        }

        .divider-text {
          background: rgba(255, 255, 255, 0.95);
          padding: 0 16px;
          color: #718096;
          font-size: 14px;
          font-weight: 500;
        }

        .signup-button {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .signup-button:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
        }

        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
          }

          .hero-section {
            padding: 40px 20px;
            text-align: center;
          }

          .hero-title {
            font-size: 36px;
          }

          .features {
            gap: 16px;
          }

          .login-section {
            padding: 20px;
          }

          .login-card {
            padding: 32px 24px;
          }
        }
      `}</style>

      <div className="background-animation"></div>
      
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="login-container">
        <div className="hero-section">
          <div className="hero-content">
            <div className="logo">
              <div className="logo-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="logo-text">QuizzyVerse</div>
            </div>

            <h1 className="hero-title">
              Welcome Back to Your Learning Journey
            </h1>
            <p className="hero-subtitle">
              Access your personalized dashboard, track your progress, and continue learning with our comprehensive educational platform.
            </p>

            <div className="features">
              <div className="feature">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="feature-text">Track your learning progress</div>
              </div>
              <div className="feature">
                <div className="feature-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="feature-text">Connect with teachers and classmates</div>
              </div>
              <div className="feature">
                <div className="feature-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="feature-text">Achieve your learning goals</div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-section">
          <div className="login-card">
            <div className="login-header">
              <h2 className="login-title">Sign In</h2>
              <p className="login-subtitle">Enter your credentials to access your account</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`login-button ${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-arrow-right"></i>
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span className="divider-text">Don't have an account?</span>
            </div>

            <button 
              onClick={() => navigate('/html-signup')} 
              className="signup-button"
            >
              <i className="fas fa-user-plus"></i>
              <span>Create New Account</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HtmlLoginPage;
