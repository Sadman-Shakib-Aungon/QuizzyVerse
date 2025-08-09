import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, onLogout }) => (
  <nav>
    <Link to="/">Home</Link>
    {isLoggedIn ? (
      <>
        <button onClick={onLogout}>Logout</button>
      </>
    ) : (
      <>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
      </>
    )}
  </nav>
);

export default Navbar;
