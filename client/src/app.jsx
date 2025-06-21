import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Sessions from './pages/Sessions';
import SessionCreate from './pages/SessionCreate';
import SessionBoard from './pages/SessionBoard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Contact from './pages/Contact';
import SessionTemplates from './pages/SessionTemplates';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/sessions/new" element={<SessionCreate />} />
        <Route path="/sessions/:id" element={<SessionBoard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/templates" element={<SessionTemplates />} />
      </Routes>
    </>
  );
}

export default App;
