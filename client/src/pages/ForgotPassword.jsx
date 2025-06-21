import React, { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setMessage('If this email is registered, you will receive a password reset link.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white/90 p-10 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-blue-700 mb-2 text-center">Forgot Password</h2>
        {message && <div className="mb-2 text-green-600 text-center font-medium">{message}</div>}
        {error && <div className="mb-2 text-red-600 text-center font-medium">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition">Send Reset Link</button>
      </form>
    </div>
  );
}

export default ForgotPassword; 