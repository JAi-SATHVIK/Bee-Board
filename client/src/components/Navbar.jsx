import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav>
      <div className="flex flex-row items-center gap-4">
        <Link to="/" className="flex items-center gap-2" style={{textDecoration: 'none'}}>
          <span style={{fontSize: '2.1rem', color: '#FFD600', marginRight: '6px'}}>
            🐝
          </span>
          <span style={{fontWeight: 900, fontSize: '1.7rem', color: '#111', letterSpacing: '-1px'}}>BeeBoard</span>
        </Link>
        {isLoggedIn && <Link to="/sessions" className="bg-yellow rounded" style={{textDecoration: 'none'}}>Sessions</Link>}
        <Link to="/contact" className="bg-yellow rounded" style={{textDecoration: 'none'}}>Contact</Link>
        {isLoggedIn && <Link to="/profile" className="bg-yellow rounded" style={{textDecoration: 'none'}}>Profile</Link>}
      </div>
      <div className="flex flex-row items-center gap-2">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="bg-black rounded" style={{textDecoration: 'none'}}>Login</Link>
            <Link to="/register" className="bg-yellow rounded" style={{textDecoration: 'none'}}>Get Started</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="bg-black rounded" style={{background:'#111', color:'#FFD600', border:'none'}}>Logout</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 