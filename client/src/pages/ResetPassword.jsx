import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setMessage('Your password has been reset.');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white/90 p-10 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-blue-700 mb-2 text-center">Reset Password</h2>
        {message && <div className="mb-2 text-green-600 text-center font-medium">{message}</div>}
        {error && <div className="mb-2 text-red-600 text-center font-medium">{error}</div>}
        <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} className="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
        <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} className="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword; 