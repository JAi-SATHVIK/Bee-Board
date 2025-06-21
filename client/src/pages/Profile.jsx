import React, { useEffect, useState } from 'react';

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setUser(data.data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50"><div className="p-8 bg-white/90 rounded-2xl shadow-xl">Loading...</div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50"><div className="p-8 bg-white/90 rounded-2xl shadow-xl text-red-600">{error}</div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Profile</h2>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex gap-2 items-center"><span className="font-semibold text-gray-700">Username:</span> <span className="text-blue-700">{user.username}</span></div>
          <div className="flex gap-2 items-center"><span className="font-semibold text-gray-700">Email:</span> <span className="text-blue-700">{user.email}</span></div>
          <div className="flex gap-2 items-center"><span className="font-semibold text-gray-700">Role:</span> <span className="text-green-700 capitalize">{user.role}</span></div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 