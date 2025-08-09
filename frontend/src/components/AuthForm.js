import React, { useState } from 'react';

const AuthForm = ({ type, onSubmit }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'student',
    name: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      {type === 'signup' && (
        <>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            onChange={handleChange}
            value={form.role}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </>
      )}
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit">{type === 'login' ? 'Login' : 'Sign Up'}</button>
    </form>
  );
};

export default AuthForm;