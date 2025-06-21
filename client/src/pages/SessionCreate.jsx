import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SessionCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const body = { title, description, privacy };
      if (privacy === 'password-protected') {
        body.password = password;
      }
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
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
        setError(backendMessage || 'Failed to create session.');
        return;
      }
      if (!data.success) {
        setError(backendMessage || 'Failed to create session.');
        return;
      }
      navigate(`/sessions/${data.data.session._id}`);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Create New Session</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="mb-2 text-red-600 text-center font-medium">{error}</div>}
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <select value={privacy} onChange={e => setPrivacy(e.target.value)} className="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="password-protected">Password Protected</option>
          </select>
          {privacy === 'password-protected' && (
            <input
              type="password"
              placeholder="Session Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          )}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition">Create Session</button>
        </form>
      </div>
    </div>
  );
}

export default SessionCreate; 