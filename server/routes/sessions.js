const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middleware/authMiddleware');
const Idea = require('../models/Idea');
const ChatMessage = require('../models/ChatMessage');
const Question = require('../models/Question');
const User = require('../models/User');
const { getIO } = require('../sockets');


router.post('/', authenticate, sessionController.createSession);

router.get('/', authenticate, sessionController.getSessions);

router.get('/:id', authenticate, sessionController.getSession);

router.post('/:id/join', authenticate, sessionController.joinSession);

router.put('/:id', authenticate, sessionController.updateSession);

router.post('/:id/start', authenticate, sessionController.startSession);

router.post('/:id/end', authenticate, (req, res) => {
  // Simulate marking session as ended
  // In a real app, update DB: { ended: true }
  res.json({ success: true, message: 'Session ended (soft delete)' });
});

router.delete('/:id', authenticate, sessionController.deleteSession);

// Real chat endpoints
router.get('/:id/chat', authenticate, async (req, res) => {
  const session = await require('../models/Session').findById(req.params.id);
  const userId = req.user.userId;
  const hasAccess = session && (session.creator.equals(userId) || session.facilitators.some(f => f.equals(userId)) || session.participants.some(p => p.user.equals(userId)));
  if (!hasAccess && session && (session.privacy === 'private' || session.privacy === 'password-protected')) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const messages = await ChatMessage.find({ sessionId: req.params.id })
    .sort({ createdAt: 1 })
    .populate('sender', 'username');
  res.json({
    success: true,
    data: {
      messages: messages.map(msg => ({
        _id: msg._id,
        text: msg.message,
        username: msg.sender?.username || 'User',
        createdAt: msg.createdAt
      }))
    }
  });
});

router.post('/:id/chat', authenticate, async (req, res) => {
  const session = await require('../models/Session').findById(req.params.id);
  const userId = req.user.userId;
  const hasAccess = session && (session.creator.equals(userId) || session.facilitators.some(f => f.equals(userId)) || session.participants.some(p => p.user.equals(userId)));
  if (!hasAccess && session && (session.privacy === 'private' || session.privacy === 'password-protected')) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message required' });
  const chatMsg = await ChatMessage.create({
    sessionId: req.params.id,
    sender: req.user.userId,
    message
  });
  await chatMsg.populate('sender', 'username');
  // Emit real-time update
  const io = getIO();
  io.to(req.params.id).emit('chat-message', {
    _id: chatMsg._id,
    text: chatMsg.message,
    username: chatMsg.sender?.username || 'User',
    createdAt: chatMsg.createdAt
  });
  res.json({
    success: true,
    data: {
      message: {
        _id: chatMsg._id,
        text: chatMsg.message,
        username: chatMsg.sender?.username || 'User',
        createdAt: chatMsg.createdAt
      }
    }
  });
});

// Real questions endpoints
router.get('/:id/questions', authenticate, async (req, res) => {
  const session = await require('../models/Session').findById(req.params.id);
  const userId = req.user.userId;
  const hasAccess = session && (session.creator.equals(userId) || session.facilitators.some(f => f.equals(userId)) || session.participants.some(p => p.user.equals(userId)));
  if (!hasAccess && session && (session.privacy === 'private' || session.privacy === 'password-protected')) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const questions = await Question.find({ sessionId: req.params.id })
    .sort({ createdAt: 1 })
    .populate('author', 'username');
  res.json({
    success: true,
    data: {
      questions: questions.map(q => ({
        _id: q._id,
        text: q.question,
        username: q.author?.username || 'User',
        isAnonymous: q.isAnonymous,
        category: q.category,
        priority: q.priority,
        status: q.status,
        upvotes: q.upvotes.length,
        downvotes: q.downvotes.length,
        answers: q.answers,
        createdAt: q.createdAt
      }))
    }
  });
});

router.post('/:id/questions', authenticate, async (req, res) => {
  const session = await require('../models/Session').findById(req.params.id);
  const userId = req.user.userId;
  const hasAccess = session && (session.creator.equals(userId) || session.facilitators.some(f => f.equals(userId)) || session.participants.some(p => p.user.equals(userId)));
  if (!hasAccess && session && (session.privacy === 'private' || session.privacy === 'password-protected')) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const { text, isAnonymous, category, priority } = req.body;
  if (!text) return res.status(400).json({ success: false, message: 'Question required' });
  const question = await Question.create({
    sessionId: req.params.id,
    author: req.user.userId,
    question: text,
    isAnonymous,
    category,
    priority
  });
  await question.populate('author', 'username');
  // Emit real-time update
  const io = getIO();
  io.to(req.params.id).emit('question-action', { action: 'add', payload: {
    _id: question._id,
    text: question.question,
    username: question.author?.username || 'User',
    isAnonymous: question.isAnonymous,
    category: question.category,
    priority: question.priority,
    status: question.status,
    upvotes: question.upvotes.length,
    downvotes: question.downvotes.length,
    answers: question.answers,
    createdAt: question.createdAt
  }});
  res.json({
    success: true,
    data: {
      question: {
        _id: question._id,
        text: question.question,
        username: question.author?.username || 'User',
        isAnonymous: question.isAnonymous,
        category: question.category,
        priority: question.priority,
        status: question.status,
        upvotes: question.upvotes.length,
        downvotes: question.downvotes.length,
        answers: question.answers,
        createdAt: question.createdAt
      }
    }
  });
});

// Answer a question
router.post('/:id/questions/:questionId/answer', authenticate, async (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ success: false, message: 'Answer required' });
  const question = await Question.findById(req.params.questionId);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
  const answerObj = {
    answer,
    author: req.user.userId,
    createdAt: new Date()
  };
  question.answers = question.answers || [];
  question.answers.push(answerObj);
  question.status = 'answered';
  question.answeredBy = req.user.userId;
  question.answeredAt = new Date();
  await question.save();
  // Emit real-time update
  const io = getIO();
  io.to(req.params.id).emit('question-action', { action: 'answer', payload: { id: question._id, answer: answerObj, status: 'answered' } });
  res.json({ success: true, data: { answer: answerObj } });
});

// Placeholder priority zones endpoints
router.get('/:id/zones', authenticate, (req, res) => {
  res.json({ success: true, data: { zones: [] } });
});

router.post('/:id/zones', authenticate, (req, res) => {
  res.json({ success: true, data: { zone: req.body.zone || {} } });
});

// Placeholder DELETE canvas endpoint
router.delete('/:id/canvas', authenticate, (req, res) => {
  res.json({ success: true });
});

// Placeholder facilitator endpoints
router.post('/:id/facilitator/lock', authenticate, (req, res) => {
  res.json({ success: true });
});
router.post('/:id/facilitator/unlock', authenticate, (req, res) => {
  res.json({ success: true });
});
router.post('/:id/facilitator/start-timer', authenticate, (req, res) => {
  res.json({ success: true });
});
router.post('/:id/facilitator/stop-timer', authenticate, (req, res) => {
  res.json({ success: true });
});

// Permanently delete session
router.delete('/:id/permanent', authenticate, (req, res) => {
  // Simulate permanent delete
  // In a real app, remove from DB
  res.json({ success: true, message: 'Session permanently deleted' });
});

// Get all ideas for a session
router.get('/:id/ideas', authenticate, async (req, res) => {
  const ideas = await Idea.find({ sessionId: req.params.id });
  res.json({ success: true, data: { ideas } });
});

// Add a new idea
router.post('/:id/ideas', authenticate, async (req, res) => {
  const idea = await Idea.create({
    sessionId: req.params.id,
    text: req.body.text,
    createdBy: req.user.userId
  });
  // Emit real-time update
  const io = getIO();
  io.to(req.params.id).emit('idea-action', { action: 'add', payload: idea });
  res.json({ success: true, data: { idea } });
});

module.exports = router;