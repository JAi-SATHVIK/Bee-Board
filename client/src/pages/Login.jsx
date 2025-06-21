import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
        setError(backendMessage || 'Login failed.');
        return;
      }
      if (!data.success) {
        setError(backendMessage || 'Login failed.');
        return;
      }
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userId', data.data.user._id);
      localStorage.setItem('username', data.data.user.username);
      navigate('/sessions');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="card flex flex-col gap-2 items-center shadow" style={{maxWidth: 400, width: '100%'}}>
        <span style={{fontSize: '2.5rem', marginBottom: 8, color: '#FFD600'}}>🐝</span>
        <h2 className="text-center mb-2" style={{fontWeight: 900, fontSize: '2rem', color: '#FFD600', letterSpacing: '-1px'}}>Welcome Back!</h2>
        <div style={{fontSize: '1.08rem', color: '#333', marginBottom: 18, textAlign: 'center'}}>Log in to your hive and boost your productivity!</div>
        {error && <div className="text-error text-center mb-2">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="mt-2 bg-yellow rounded">Login</button>
        <div className="flex flex-row items-center gap-2 mt-2 text-center justify-center" style={{marginTop: 10}}>
          <span style={{color: '#555'}}>Don&apos;t have an account?</span>
          <button type="button" className="bg-black rounded" style={{color:'#FFD600', border:'none', padding:'8px 18px', fontWeight:700, cursor:'pointer'}} onClick={() => navigate('/register')}>Join the Hive</button>
        </div>
      </form>
    </div>
  );
}

export default Login; 