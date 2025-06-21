const { Server } = require('socket.io');
const config = require('../config/config');
const { Session, CanvasElement, ChatMessage, Question, SessionActivity } = require('../models');

let ioInstance;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: config.SOCKET_CORS
  });

  // Track viewers per session (Set of socket IDs)
  const sessionViewers = {}; // { sessionId: Set<socket.id> }
  const socketSessionMap = {}; // { socket.id: sessionId }
  const socketUserMap = {}; // { socket.id: userId }

  ioInstance.on('connection', (socket) => {
    socket.on('join-session', async ({ sessionId, userId }) => {
      socket.join(sessionId);
      socketSessionMap[socket.id] = sessionId;
      socketUserMap[socket.id] = userId;
      if (!sessionViewers[sessionId]) sessionViewers[sessionId] = new Set();
      sessionViewers[sessionId].add(socket.id);
      ioInstance.to(sessionId).emit('viewer-count', { count: sessionViewers[sessionId].size });
      ioInstance.to(sessionId).emit('user-joined', { userId });
    });

    socket.on('leave-session', ({ sessionId, userId }) => {
      socket.leave(sessionId);
      if (sessionViewers[sessionId]) sessionViewers[sessionId].delete(socket.id);
      delete socketSessionMap[socket.id];
      delete socketUserMap[socket.id];
      ioInstance.to(sessionId).emit('viewer-count', { count: sessionViewers[sessionId] ? sessionViewers[sessionId].size : 0 });
      ioInstance.to(sessionId).emit('user-left', { userId });
    });

    socket.on('idea-action', ({ sessionId, action, payload }) => {
      ioInstance.to(sessionId).emit('idea-action', { action, payload });
    });

    socket.on('canvas-action', async ({ sessionId, action, payload }) => {
      console.log('[Socket.IO] Emitting canvas-action', sessionId, action, payload);
      ioInstance.to(sessionId).emit('canvas-action', { action, payload });
    });

    socket.on('chat-message', async ({ sessionId, message }) => {
      console.log('[Socket.IO] Emitting chat-message', sessionId, message);
      ioInstance.to(sessionId).emit('chat-message', message);
    });

    socket.on('question-action', async ({ sessionId, action, payload }) => {
      console.log('[Socket.IO] Emitting question-action', sessionId, action, payload);
      ioInstance.to(sessionId).emit('question-action', { action, payload });
    });

    socket.on('facilitator-action', async ({ sessionId, action, payload }) => {
      ioInstance.to(sessionId).emit('facilitator-action', { action, payload });
    });

    socket.on('disconnect', () => {
      const sessionId = socketSessionMap[socket.id];
      const userId = socketUserMap[socket.id];
      if (sessionId && sessionViewers[sessionId]) {
        sessionViewers[sessionId].delete(socket.id);
        ioInstance.to(sessionId).emit('viewer-count', { count: sessionViewers[sessionId].size });
        ioInstance.to(sessionId).emit('user-left', { userId });
      }
      delete socketSessionMap[socket.id];
      delete socketUserMap[socket.id];
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized!');
  }
  return ioInstance;
}

module.exports = { initSocket, getIO }; 