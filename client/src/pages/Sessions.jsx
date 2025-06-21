import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        let data = {};
        let backendMessage = '';
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
          backendMessage = data.message;
        } else {
          backendMessage = await res.text();
        }
        if (!res.ok) {
          setError(backendMessage || 'Failed to load sessions.');
          return;
        }
        if (!data.success) {
          setError(backendMessage || 'Failed to load sessions.');
          return;
        }
        setSessions(data.data.sessions);
      } catch (err) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  // Add delete handler
  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/sessions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setSessions(sessions => sessions.filter(s => s._id !== id));
  };

  return (
    <div className="container flex flex-col items-center justify-center" style={{minHeight: '70vh', width: '100vw', maxWidth: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', background: '#fff'}}>
      <div className="flex flex-col items-center mb-6" style={{width: '100%'}}>
        <span style={{fontSize: '2.8rem', marginBottom: 8, display: 'block', textAlign: 'center'}}>🐝</span>
        <h2 style={{
          fontWeight: 900,
          fontSize: '2.6rem',
          color: '#FFD600',
          textShadow: '2px 2px 0 #111, 0 2px 16px #ffd60055',
          marginBottom: 8,
          letterSpacing: '-1px',
          textAlign: 'center',
        }}>Your Sessions</h2>
        <div style={{fontSize: '1.15rem', color: '#444', marginBottom: 18, textAlign: 'center', fontWeight: 500}}>
          Organize your productivity game!
        </div>
        <Link to="/sessions/new" style={{
          display: 'inline-block',
          background: '#FFD600',
          color: '#111',
          fontWeight: 800,
          fontSize: '1.18rem',
          borderRadius: 18,
          padding: '18px 38px',
          boxShadow: '0 4px 24px #ffd60055',
          marginBottom: 18,
          textDecoration: 'none',
          letterSpacing: '-0.5px',
          border: 'none',
          textAlign: 'center',
        }}>+ Create New Session</Link>
      </div>
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-error mb-4 text-center">{error}</div>}
      <div className="w-full" style={{padding: '0 2vw'}}>
        {sessions.length === 0 && !loading && (
          <div className="card flex flex-col items-center shadow" style={{padding: '40px 0', color: '#888', fontWeight: 500}}>
            No sessions yet. Start your first session!
          </div>
        )}
        <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '48px',
          width: '100%',
          justifyItems: 'center',
        }}>
          {sessions.map((session, idx) => (
            <div key={session._id} style={{
              background: '#fff',
              border: '3px solid #FFD600',
              borderRadius: 28,
              boxShadow: '0 8px 32px #ffd60033',
              minHeight: 200,
              minWidth: 200,
              maxWidth: 240,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '18px 14px 14px 14px',
              position: 'relative',
              transition: 'box-shadow 0.18s',
            }}>
              <div>
                <div style={{fontWeight: 900, fontSize: '1.08rem', color: '#111', marginBottom: 6, letterSpacing: '-0.5px'}}>{idx + 1}. <span style={{fontWeight: 900}}>{session.title}</span></div>
                <div style={{color: '#888', fontSize: '0.95rem', marginBottom: 16}}>{session.description}</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', position: 'absolute', left: 14, bottom: 14}}>
                <Link to={`/sessions/${session._id}`} style={{
                  background: '#111',
                  color: '#FFD600',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  borderRadius: 14,
                  padding: '8px 18px',
                  border: 'none',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px #1112',
                  letterSpacing: '-0.5px',
                  transition: 'background 0.15s, color 0.15s',
                }}>Open</Link>
                <button onClick={() => handleDeleteSession(session._id)} style={{
                  background: '#FFD600',
                  color: '#111',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  borderRadius: 14,
                  padding: '8px 18px',
                  border: 'none',
                  boxShadow: '0 2px 8px #ffd60033',
                  letterSpacing: '-0.5px',
                  transition: 'background 0.15s, color 0.15s',
                  cursor: 'pointer',
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sessions; 