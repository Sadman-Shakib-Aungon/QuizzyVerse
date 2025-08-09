import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function DemoSetupPage() {
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [count, setCount] = useState(0);

  const showStatus = (message, type = 'success') => {
    setStatus({ message, type });
  };

  const addDemoUser = (userData) => {
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const filtered = existingUsers.filter((u) => u.email !== userData.email);
    filtered.push(userData);
    localStorage.setItem('registeredUsers', JSON.stringify(filtered));
    setCount(filtered.length);
  };

  const createNewStudent = () => {
    const userData = {
      firstName: 'New',
      lastName: 'Student',
      email: 'newstudent@university.edu',
      role: 'student',
      isNewUser: true,
      hasActivity: false,
      createdAt: new Date().toISOString(),
      quizzesTaken: 0,
      coursesEnrolled: 0,
      hoursStudied: 0,
      averageScore: 0,
      activityHistory: []
    };
    addDemoUser(userData);
    showStatus('New Student created! Login: newstudent@university.edu / password123');
  };

  const createExistingStudent = () => {
    const userData = {
      firstName: 'Existing',
      lastName: 'Student',
      email: 'student@university.edu',
      role: 'student',
      isNewUser: false,
      hasActivity: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      quizzesTaken: 15,
      coursesEnrolled: 3,
      hoursStudied: 45,
      averageScore: 87,
      activityHistory: [
        {
          type: 'quiz',
          title: 'Mathematics Quiz',
          score: 92,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'course',
          title: 'Completed Physics Course',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    addDemoUser(userData);
    showStatus('Existing Student created! Login: student@university.edu / password123');
  };

  const createNewTeacher = () => {
    const userData = {
      firstName: 'New',
      lastName: 'Teacher',
      email: 'newteacher@school.edu',
      role: 'teacher',
      isNewUser: true,
      hasActivity: false,
      createdAt: new Date().toISOString(),
      classrooms: [],
      quizzesCreated: 0,
      studentsManaged: 0
    };
    addDemoUser(userData);
    showStatus('New Teacher created! Login: newteacher@school.edu / password123');
  };

  const createExistingTeacher = () => {
    const userData = {
      firstName: 'Existing',
      lastName: 'Teacher',
      email: 'teacher@school.edu',
      role: 'teacher',
      isNewUser: false,
      hasActivity: true,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      classrooms: [
        { id: '1', name: 'Mathematics 101', subject: 'Mathematics', studentCount: 25 },
        { id: '2', name: 'Physics Advanced', subject: 'Physics', studentCount: 18 }
      ],
      quizzesCreated: 12,
      studentsManaged: 43
    };
    addDemoUser(userData);
    showStatus('Existing Teacher created! Login: teacher@school.edu / password123');
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all demo data?')) {
      localStorage.removeItem('registeredUsers');
      localStorage.removeItem('currentUser');
      setCount(0);
      showStatus('All demo data cleared!', 'info');
    }
  };

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    setCount(users.length);
    if (users.length > 0) {
      showStatus(`Currently ${users.length} demo users in system.`, 'info');
    } else {
      showStatus('No demo users found. Create some using the buttons below.', 'info');
    }
  }, []);

  return (
    <div style={{
      fontFamily: 'Inter, system-ui, Arial, sans-serif',
      maxWidth: 900,
      margin: '40px auto',
      padding: 20
    }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginTop: 0, textAlign: 'center' }}>QuizzyVerse Demo Setup</h1>
        <p style={{ textAlign: 'center', color: '#555' }}>Create realistic demo users to test new vs. existing user flows.</p>

        <div style={{ margin: '20px 0', padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
          <h3>Demo Users Setup</h3>
          <p>Click the buttons below to create demo users with different activity levels:</p>
          <div>
            <button onClick={createNewStudent}>Create New Student (No Activity)</button>
            <button onClick={createExistingStudent}>Create Existing Student (With Activity)</button>
            <button onClick={createNewTeacher}>Create New Teacher (No Activity)</button>
            <button onClick={createExistingTeacher}>Create Existing Teacher (With Activity)</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <small style={{ color: '#666' }}>Users in system: {count}</small>
          </div>
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: status.type === 'success' ? '#d4edda' : '#d1ecf1',
                color: status.type === 'success' ? '#155724' : '#0c5460',
                border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#bee5eb'}`
              }}
            >
              {status.message}
            </div>
          </div>
        </div>

        <div style={{ margin: '20px 0', padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
          <h3>Test Login Credentials</h3>
          <div style={{ padding: 12, borderRadius: 8, background: '#f5fbff', border: '1px solid #bee5eb' }}>
            <strong>New Users (No Activity):</strong><br />
            • Student: newstudent@university.edu / password123<br />
            • Teacher: newteacher@school.edu / password123
            <br /><br />
            <strong>Existing Users (With Activity):</strong><br />
            • Student: student@university.edu / password123<br />
            • Teacher: teacher@school.edu / password123
          </div>
        </div>

        <div style={{ margin: '20px 0', padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
          <h3>Clear All Data</h3>
          <button onClick={clearAllData} style={{ background: '#dc3545' }}>Clear All Demo Data</button>
          <p><small>This will remove all demo users and reset the system.</small></p>
        </div>

        <div style={{ margin: '20px 0', padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
          <h3>Quick Links</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/login"><button>Go to Login Page</button></Link>
            <Link to="/signup"><button>Go to Signup Page</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoSetupPage;

