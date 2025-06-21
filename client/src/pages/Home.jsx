import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setCheckedAuth(true);
    }
  }, [navigate]);

  if (!checkedAuth) return null;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#fffbe7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      margin: '0',
    }}>
      {/* Hero Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 32,
        width: '100%',
      }}>
        <span style={{fontSize: '3.2rem', color: '#FFD600', marginBottom: 8}}>🐝</span>
        <h1 className="heading-xl text-center" style={{marginBottom: 14, fontSize: '2.8rem'}}>
          Real-Time <span style={{color: '#111'}}>Collaboration</span><br/>
          <span style={{color: '#FFD600'}}>for Creative Teams</span>
        </h1>
        <p style={{fontSize: '1.25rem', color: '#333', marginBottom: 0, textAlign: 'center', maxWidth: 600, fontWeight: 500}}>
          BeeBoard is your real-time idea incubator for brainstorming, mind-mapping, and structured teamwork.<br/>
          Instantly share, organize, and prioritize ideas with your team from anywhere.
        </p>
      </div>

      {/* Feature Cards Section - Responsive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '32px',
        width: '100%',
        maxWidth: 1200,
        padding: '0 32px 48px 32px',
        boxSizing: 'border-box',
      }}>
        {/* Feature 1 */}
        <div className="card shadow" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          minHeight: 220, padding: '38px 24px', background: '#fff', borderRadius: 24,
          transition: 'transform 0.18s, box-shadow 0.18s',
          cursor: 'pointer',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px #ffd60044'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px #ffd60033'; }}
        >
          <span style={{fontSize: '2.6rem', marginBottom: 16}}>📝</span>
          <h3 style={{fontWeight: 800, fontSize: '1.35rem', color: '#FFD600', marginBottom: 10}}>Infinite Whiteboard</h3>
          <p style={{textAlign: 'center', color: '#444', fontSize: '1.08rem'}}>Collaborate visually with sticky notes, text, and shapes in real time.</p>
        </div>
        {/* Feature 2 */}
        <div className="card shadow" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          minHeight: 220, padding: '38px 24px', background: '#fff', borderRadius: 24,
          transition: 'transform 0.18s, box-shadow 0.18s',
          cursor: 'pointer',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px #ffd60044'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px #ffd60033'; }}
        >
          <span style={{fontSize: '2.6rem', marginBottom: 16}}>🤝</span>
          <h3 style={{fontWeight: 800, fontSize: '1.35rem', color: '#FFD600', marginBottom: 10}}>Real-Time Teamwork</h3>
          <p style={{textAlign: 'center', color: '#444', fontSize: '1.08rem'}}>Work together live—brainstorm, mind-map, and connect ideas instantly.</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 