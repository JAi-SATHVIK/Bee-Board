import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Canvas from '../components/Canvas';
import Chat from '../components/Chat';
import QA from '../components/QA';
import PriorityZones from '../components/PriorityZones';
import SessionHistory from '../components/SessionHistory';
import ExportPanel from '../components/ExportPanel';
import { useSocket } from '../contexts/SocketContext';
import useSocketEvents from '../hooks/useSocketEvents';
import Shape from '../components/Shape';
import StickyNote from '../components/StickyNote';
import TextBox from '../components/TextBox';
import { HexColorPicker } from 'react-colorful';
import { FaSquare, FaCircle, FaStickyNote, FaFont, FaLongArrowAltRight, FaTrash, FaPalette } from 'react-icons/fa';

// Normalization helpers
function normalizeMessage(msg) {
  return {
    _id: msg._id,
    text: msg.text || msg.message || '',
    username: msg.username || msg.user || 'User',
    createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
  };
}
function normalizeQuestion(q) {
  return {
    _id: q._id,
    text: q.text || q.question || '',
    username: q.username || (q.author && (q.author.username || q.author._id)) || 'User',
    isAnonymous: q.isAnonymous,
    category: q.category,
    priority: q.priority,
    status: q.status,
    upvotes: q.upvotes?.length || 0,
    downvotes: q.downvotes?.length || 0,
    answers: q.answers || [],
    createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
  };
}

function SessionBoard() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [zones, setZones] = useState([]);
  const [activities, setActivities] = useState([]);
  const [locked, setLocked] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [elements, setElements] = useState([]);
  const [colorPickerId, setColorPickerId] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef();
  const [showUniversalColor, setShowUniversalColor] = useState(false);
  const [uiError, setUiError] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState({ id: null, offsetX: 0, offsetY: 0 });
  const [ideas, setIdeas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ideas') || '[]');
    } catch {
      return [];
    }
  });
  const [ideaText, setIdeaText] = useState('');
  const [viewerCount, setViewerCount] = useState(1);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [joinRequired, setJoinRequired] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [sessionPrivacy, setSessionPrivacy] = useState(null);

  // Reset chat and questions when session changes
  useEffect(() => {
    setMessages([]);
    setQuestions([]);
  }, [sessionId]);

  // Fetch initial chat and Q&A from backend
  useEffect(() => {
    async function fetchChatAndQA() {
      const token = localStorage.getItem('token');
      // Fetch session info to get privacy
      const sessionRes = await fetch(`/api/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (sessionRes.status === 403) {
        let privacy = 'private';
        try {
          const data = await sessionRes.json();
          if (data && data.privacy) privacy = data.privacy;
        } catch {}
        setJoinRequired(true);
        setSessionPrivacy(privacy);
        return;
      }
      if (sessionRes.ok) {
        const data = await sessionRes.json();
        setSessionPrivacy(data.data.session.privacy);
      }
      // Fetch chat messages
      const chatRes = await fetch(`/api/sessions/${sessionId}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (chatRes.status === 403) {
        setJoinRequired(true);
        return;
      }
      if (chatRes.ok) {
        const data = await chatRes.json();
        setMessages((data.data.messages || []).map(normalizeMessage).sort((a, b) => b.createdAt - a.createdAt));
      }
      // Fetch questions
      const qaRes = await fetch(`/api/sessions/${sessionId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (qaRes.status === 403) {
        setJoinRequired(true);
        return;
      }
      if (qaRes.ok) {
        const data = await qaRes.json();
        setQuestions((data.data.questions || []).map(normalizeQuestion).sort((a, b) => b.createdAt - a.createdAt));
      }
      setJoinRequired(false);
    }
    if (sessionId) fetchChatAndQA();
  }, [sessionId]);

  // Fetch initial canvas elements
  useEffect(() => {
    async function fetchElements() {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sessions/${sessionId}/canvas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setElements(data.data.elements || []);
        setUiError("");
      } else if (res.status === 403) {
        setJoinRequired(true);
        setUiError("");
        setElements([]);
      } else if (res.status === 404) {
        setUiError("Session not found or you do not have access to the canvas.");
        setElements([]);
      } else {
        setUiError("Failed to load canvas. Please try again later.");
        setElements([]);
      }
    }
    if (sessionId) fetchElements();
  }, [sessionId]);

  // Join session handler (refetch data after join, don't reload page)
  const handleJoinSession = async (e) => {
    e.preventDefault();
    setJoinError("");
    const token = localStorage.getItem('token');
    const body = sessionPrivacy === 'password-protected' ? { password: joinPassword } : {};
    const res = await fetch(`/api/sessions/${sessionId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setJoinError(data.message || 'Failed to join session.');
      return;
    }
    // Success: refetch everything
    setJoinRequired(false);
    setJoinPassword("");
    setJoinError("");
    // Refetch all data
    const fetchAll = async () => {
      await Promise.all([
        (async () => {
          const token = localStorage.getItem('token');
          const sessionRes = await fetch(`/api/sessions/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
          if (sessionRes.ok) {
            const data = await sessionRes.json();
            setSessionPrivacy(data.data.session.privacy);
          }
        })(),
        (async () => {
          const token = localStorage.getItem('token');
          const chatRes = await fetch(`/api/sessions/${sessionId}/chat`, { headers: { Authorization: `Bearer ${token}` } });
          if (chatRes.ok) {
            const data = await chatRes.json();
            setMessages((data.data.messages || []).map(normalizeMessage).sort((a, b) => b.createdAt - a.createdAt));
          }
        })(),
        (async () => {
          const token = localStorage.getItem('token');
          const qaRes = await fetch(`/api/sessions/${sessionId}/questions`, { headers: { Authorization: `Bearer ${token}` } });
          if (qaRes.ok) {
            const data = await qaRes.json();
            setQuestions((data.data.questions || []).map(normalizeQuestion).sort((a, b) => b.createdAt - a.createdAt));
          }
        })(),
        (async () => {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/sessions/${sessionId}/canvas`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setElements(data.data.elements || []);
            setUiError("");
          }
        })(),
      ]);
    };
    fetchAll();
  };

  // Join session on mount
  useEffect(() => {
    if (socket && sessionId) {
      const userId = localStorage.getItem('userId');
      console.log('[Socket] Joining session', sessionId, userId, socket);
      socket.emit('join-session', { sessionId, userId });
      return () => {
        socket.emit('leave-session', { sessionId, userId });
      };
    }
  }, [socket, sessionId]);

  // Real-time event handlers (combine all in one call)
  useSocketEvents({
    'chat-message': (msg) => {
      console.log('[Socket] Received chat-message', msg);
      setMessages((prev) => {
        const newMsg = normalizeMessage(msg.message || msg);
        const arr = [newMsg, ...prev];
        arr.sort((a, b) => b.createdAt - a.createdAt);
        return arr.slice(0, 20);
      });
    },
    'question-action': ({ action, payload }) => {
      console.log('[Socket] Received question-action', action, payload);
      if (action === 'add') {
        setQuestions((prev) => {
          const newQ = normalizeQuestion(payload);
          const arr = [newQ, ...prev];
          arr.sort((a, b) => b.createdAt - a.createdAt);
          return arr.slice(0, 10);
        });
      }
      if (action === 'answer') {
        setQuestions((prev) => prev.map(q =>
          q._id === payload.id
            ? {
                ...q,
                answers: [...(q.answers || []), payload.answer],
                status: payload.status || 'answered',
              }
            : q
        ));
      }
    },
    'idea-action': ({ action, payload }) => {
      if (action === 'add') setIdeas((prev) => [...prev, payload]);
    },
    'zone-action': ({ action, payload }) => {
      if (action === 'add') setZones((prev) => [...prev, payload]);
      if (action === 'remove') setZones((prev) => prev.filter(z => z.id !== payload.id));
    },
    'facilitator-action': ({ action, payload }) => {
      if (action === 'lock') setLocked(true);
      if (action === 'unlock') setLocked(false);
      if (action === 'start-timer') setTimerActive(true);
      if (action === 'stop-timer') setTimerActive(false);
    },
    'activity-action': (activity) => setActivities((prev) => [...prev, activity]),
    'canvas-action': ({ action, payload }) => {
      console.log('[Socket] Received canvas-action', action, payload);
      if (action === 'add') setElements((prev) => [...prev, payload]);
      if (action === 'update') setElements((prev) => prev.map(e => e._id === payload._id ? payload : e));
      if (action === 'delete') setElements((prev) => prev.filter(e => e._id !== payload._id));
      if (action === 'drag') setElements((prev) => prev.map(e => e._id === payload.id ? { ...e, position: payload.position } : e));
      if (action === 'deleteAll') setElements([]);
    },
    reconnect: () => {
      console.log('[Socket] Reconnected, refetching data');
      if (sessionId) {
        // Refetch chat and Q&A
        (async () => {
          const token = localStorage.getItem('token');
          const chatRes = await fetch(`/api/sessions/${sessionId}/chat`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (chatRes.ok) {
            const data = await chatRes.json();
            setMessages((data.data.messages || []).map(normalizeMessage).sort((a, b) => b.createdAt - a.createdAt));
          }
          const qaRes = await fetch(`/api/sessions/${sessionId}/questions`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (qaRes.ok) {
            const data = await qaRes.json();
            setQuestions((data.data.questions || []).map(normalizeQuestion).sort((a, b) => b.createdAt - a.createdAt));
          }
        })();
      }
    },
  });

  // Copy selected elements
  useEffect(() => {
    const handleCopy = (e) => {
      // Remove all logic referencing selectedIds
      // Copy/paste is disabled until selection is re-implemented
    };
    window.addEventListener('keydown', handleCopy);
    return () => window.removeEventListener('keydown', handleCopy);
  }, [clipboard, elements, sessionId, socket]);

  // Copy session link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  // End session logic
  const handleEndSession = async () => {
    if (!window.confirm('Are you sure you want to end and permanently delete this session?')) return;
    await fetch(`/api/sessions/${sessionId}/permanent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    navigate('/');
  };

  // Send chat message (persist and sync)
  const handleSendMessage = async (msg) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'Anonymous';
    const res = await fetch(`/api/sessions/${sessionId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message: msg, username })
    });
    if (res.ok) {
      const data = await res.json();
      if (socket) socket.emit('chat-message', { sessionId, message: { ...data.data.message, username } });
    }
  };

  // Q&A logic (persist and sync)
  const handleAskQuestion = async (q) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'Anonymous';
    const res = await fetch(`/api/sessions/${sessionId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...q, username })
    });
    if (res.ok) {
      const data = await res.json();
      if (socket) socket.emit('question-action', { sessionId, action: 'add', payload: { ...data.data.question, username } });
    }
  };

  // Add handleAnswer for questions
  const handleAnswer = async (id, answer) => {
    if (!id || !answer) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/sessions/${sessionId}/questions/${id}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ answer })
    });
    if (res.ok) {
      const data = await res.json();
      if (socket) socket.emit('question-action', { sessionId, action: 'answer', payload: { id, answer: data.data.answer } });
    }
  };

  useEffect(() => {
    async function fetchIdeas() {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sessions/${sessionId}/ideas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.data.ideas);
      }
    }
    if (sessionId) fetchIdeas();
  }, [sessionId]);

  const handleAddIdea = async (e) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/sessions/${sessionId}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text: ideaText.trim() })
    });
    if (res.ok) {
      const data = await res.json();
      setIdeaText('');
      if (socket) socket.emit('idea-action', { sessionId, action: 'add', payload: data.data.idea });
    }
  };

  const handleAddZone = () => {
    const zone = { id: Date.now(), label: `Zone ${zones.length + 1}` };
    setZones((prev) => [...prev, zone]);
    if (socket) socket.emit('zone-action', { sessionId, action: 'add', payload: zone });
    // Optionally, POST to backend for persistence
    fetch(`/api/sessions/${sessionId}/zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(zone)
    });
  };

  const handleRemoveZone = (id) => {
    setZones((prev) => prev.filter(z => z.id !== id));
    if (socket) socket.emit('zone-action', { sessionId, action: 'remove', payload: { id } });
    // Optionally, DELETE to backend for persistence
    fetch(`/api/sessions/${sessionId}/zones/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  };

  const handleLock = () => {
    setLocked(true);
    if (socket) socket.emit('facilitator-action', { sessionId, action: 'lock' });
    fetch(`/api/sessions/${sessionId}/facilitator/lock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  };
  const handleUnlock = () => {
    setLocked(false);
    if (socket) socket.emit('facilitator-action', { sessionId, action: 'unlock' });
    fetch(`/api/sessions/${sessionId}/facilitator/unlock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  };
  const handleStartTimer = () => {
    setTimerActive(true);
    if (socket) socket.emit('facilitator-action', { sessionId, action: 'start-timer' });
    fetch(`/api/sessions/${sessionId}/facilitator/start-timer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  };
  const handleStopTimer = () => {
    setTimerActive(false);
    if (socket) socket.emit('facilitator-action', { sessionId, action: 'stop-timer' });
    fetch(`/api/sessions/${sessionId}/facilitator/stop-timer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  };
  const handleExport = () => alert('Export as PDF (demo)');

  // Infinite canvas pan/zoom state
  const handleCanvasMouseDown = (e) => {
    if (e.target.id === 'main-canvas') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };
  const handleCanvasMouseMove = (e) => {
    if (dragging.id) {
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - dragging.offsetX;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - dragging.offsetY;
      setElements((prev) => prev.map(el =>
        (el._id === dragging.id || el.tempId === dragging.id || el.id === dragging.id)
          ? { ...el, position: { ...el.position, x, y } }
          : el
      ));
    } else if (isPanning) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };
  const handleCanvasMouseUp = () => {
    if (dragging.id) {
      const el = elements.find(el => el._id === dragging.id || el.tempId === dragging.id || el.id === dragging.id);
      if (el && el._id) handleMoveElement(el._id, el.position.x, el.position.y);
      setDragging({ id: null, offsetX: 0, offsetY: 0 });
    }
    setIsPanning(false);
  };
  const handleCanvasWheel = (e) => {
    e.preventDefault();
    const newZoom = Math.max(0.2, Math.min(zoom - e.deltaY * 0.001, 2));
    setZoom(newZoom);
  };

  // Color picker: close on outside click
  useEffect(() => {
    if (!colorPickerId) return;
    const handleClick = (e) => {
      if (!canvasRef.current) return;
      if (!canvasRef.current.contains(e.target)) setColorPickerId(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [colorPickerId]);

  // Add shape handlers (icon-only)
  const handleAddShape = (type) => {
    if (!sessionId) {
      setUiError('Session ID is missing. Please make sure you are in a valid session URL.');
      console.warn('Cannot add shape: sessionId is undefined');
      return;
    }
    // Map frontend types to backend enum values
    const typeMap = {
      rectangle: 'rectangle',
      circle: 'circle',
      arrow: 'arrow',
      line: 'line',
      sticky: 'sticky-note',
      textbox: 'text-box',
    };
    const backendType = typeMap[type] || type;
    const userId = localStorage.getItem('userId');
    let newElem = {
      type: backendType,
      position: { x: 200 - offset.x, y: 200 - offset.y },
      size: backendType === 'arrow' ? { width: 120, height: 20 } : backendType === 'text-box' ? { width: 180, height: 60 } : { width: 120, height: 80 },
      content: {
        text: backendType === 'sticky-note' ? 'Sticky note' : backendType === 'text-box' ? 'Text box' : '',
        color: '#222',
        backgroundColor: backendType === 'sticky-note' ? '#fef08a' : '#f3f6fa',
      },
      style: {
        borderColor: '#2563eb',
        borderWidth: 2,
        borderRadius: backendType === 'circle' ? 999 : 8,
      },
      creator: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      showControls: false,
    };
    setElements((prev) => {
      const arr = [...prev, newElem];
      setUiError("");
      return arr;
    });
    if (socket) socket.emit('canvas-action', { sessionId, action: 'add', payload: newElem });
    fetch(`/api/sessions/${sessionId}/canvas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(newElem)
    });
  };

  // Prevent page scroll on canvas zoom
  useEffect(() => {
    const preventScroll = (e) => {
      if (e.ctrlKey || e.metaKey) return; // allow browser zoom
      if (e.target.closest && e.target.closest('#main-canvas')) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', preventScroll, { passive: false });
    return () => window.removeEventListener('wheel', preventScroll);
  }, []);

  // Universal color state
  const [universalColor, setUniversalColor] = useState('#f3f6fa');
  const handleUniversalColorChange = (color) => {
    setUniversalColor(color);
    setElements((prev) => prev.map(e => ({ ...e, color })));
    elements.forEach(e => {
      if (socket) socket.emit('canvas-action', { sessionId, action: 'update', payload: { ...e, color } });
      fetch(`/api/sessions/${sessionId}/canvas/${e._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ color })
      });
    });
  };

  // Constrain movement within visible canvas (with scrollbars)
  const CANVAS_WIDTH = 2400;
  const CANVAS_HEIGHT = 1600;
  const constrain = (x, y, width, height) => {
    const minX = 0;
    const minY = 0;
    const maxX = CANVAS_WIDTH - width;
    const maxY = CANVAS_HEIGHT - height;
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  };

  // Move element handler
  const handleMoveElement = (id, x, y) => {
    setElements((prev) => prev.map(e => e._id === id ? { ...e, position: { ...e.position, x, y } } : e));
    if (socket) socket.emit('canvas-action', { sessionId, action: 'update', payload: { ...elements.find(e => e._id === id), position: { ...elements.find(e => e._id === id)?.position, x, y } } });
    fetch(`/api/sessions/${sessionId}/canvas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ position: { x, y } })
    });
  };

  // Delete element handler
  const handleDeleteElement = (id) => {
    setElements((prev) => prev.filter(e => e._id !== id));
    if (socket) socket.emit('canvas-action', { sessionId, action: 'delete', payload: { _id: id } });
    fetch(`/api/sessions/${sessionId}/canvas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  };

  // Resize element handler
  const handleResizeElement = (id, width, height) => {
    setElements((prev) => prev.map(e => e._id === id ? { ...e, width, height } : e));
    if (socket) socket.emit('canvas-action', { sessionId, action: 'update', payload: { ...elements.find(e => e._id === id), width, height } });
    fetch(`/api/sessions/${sessionId}/canvas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ width, height })
    });
  };

  // Color picker logic
  const handleColorChange = (id, color) => {
    setElements((prev) => prev.map(e =>
      (e._id === id || e.tempId === id || e.id === id)
        ? { ...e, content: { ...e.content, backgroundColor: color } }
        : e
    ));
    const el = elements.find(e => e._id === id || e.tempId === id || e.id === id);
    if (el && el._id) {
      if (socket) socket.emit('canvas-action', { sessionId, action: 'update', payload: { ...el, content: { ...el.content, backgroundColor: color } } });
      fetch(`/api/sessions/${sessionId}/canvas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: { ...el.content, backgroundColor: color } })
      });
    }
  };

  // Edit text handler
  const handleEditText = (id, value, type) => {
    setElements((prev) => prev.map(e => {
      if (e._id === id || e.tempId === id || e.id === id) {
        if (type === 'sticky-note') {
          return { ...e, content: { ...e.content, stickyText: value } };
        } else if (type === 'text-box') {
          return { ...e, content: { ...e.content, textBoxText: value } };
        } else {
          return { ...e, content: { ...e.content, text: value } };
        }
      }
      return e;
    }));
    const el = elements.find(e => e._id === id || e.tempId === id || e.id === id);
    if (el && el._id) {
      let newContent = { ...el.content };
      if (type === 'sticky-note') newContent.stickyText = value;
      else if (type === 'text-box') newContent.textBoxText = value;
      else newContent.text = value;
      if (socket) socket.emit('canvas-action', { sessionId, action: 'update', payload: { ...el, content: newContent } });
      fetch(`/api/sessions/${sessionId}/canvas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newContent })
      });
    }
  };

  // Delete all elements handler
  const handleDeleteAll = async () => {
    setElements([]);
    if (socket) socket.emit('canvas-action', { sessionId, action: 'deleteAll' });
    await fetch(`/api/sessions/${sessionId}/canvas`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  };

  // Mouse handlers for drag
  const handleElementMouseDown = (el, e) => {
    if (e.target.tagName === 'TEXTAREA') return; // Don't drag when editing text
    e.stopPropagation();
    setDragging({
      id: el._id || el.tempId || el.id,
      offsetX: (e.clientX || (e.touches && e.touches[0].clientX)) - (el.position?.x || 0),
      offsetY: (e.clientY || (e.touches && e.touches[0].clientY)) - (el.position?.y || 0),
    });
  };

  // Add drag logic for StickyNote and TextBox
  const handleElementDragStart = (el, e) => {
    if (e.target.tagName === 'TEXTAREA') return;
    e.stopPropagation();
    setDraggedElement(el);
    setDragStart({
      x: e.clientX - (el.position?.x || 0),
      y: e.clientY - (el.position?.y || 0),
    });
  };

  const handleElementDrag = (e) => {
    if (!draggedElement || !dragStart) return;
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - dragStart.x;
    const y = (e.clientY || (e.touches && e.touches[0].y)) - dragStart.y;
    setElements((prev) => prev.map(el => el._id === draggedElement._id ? { ...el, position: { ...el.position, x, y } } : el));
    if (socket) socket.emit('canvas-action', { sessionId, action: 'drag', payload: { id: draggedElement._id, position: { x, y } } });
  };

  const handleElementDragEnd = (e) => {
    if (!draggedElement || !dragStart) return;
    const x = (e.clientX || (e.changedTouches && e.changedTouches[0].clientX)) - dragStart.x;
    const y = (e.clientY || (e.changedTouches && e.changedTouches[0].clientY)) - dragStart.y;
    handleMoveElement(draggedElement._id, x, y);
    setDraggedElement(null);
    setDragStart(null);
  };

  useEffect(() => {
    if (!draggedElement) return;
    const move = (e) => handleElementDrag(e);
    const up = (e) => handleElementDragEnd(e);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [draggedElement, dragStart]);

  // Render elements in Canvas
  const renderElements = () => {
    return elements.map((el, idx) => {
      const x = el.position?.x;
      const y = el.position?.y;
      const width = el.size?.width;
      const height = el.size?.height;
      const color = el.content?.backgroundColor || el.content?.color;
      const stroke = el.style?.borderColor;
      const strokeWidth = el.style?.borderWidth;
      const id = el._id || el.tempId || el.id;
      const onMouseDown = (e) => handleElementMouseDown(el, e);
      const showColorPicker = colorPickerId === id;
      const colorBtn = (
        <button className="color-btn" onClick={e => { e.stopPropagation(); setColorPickerId(id); }} style={{position:'absolute', top:6, left:6, zIndex:10, background:'#fff', color:'#2563eb', border:'1px solid #2563eb', borderRadius:6, width:24, height:24, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.10)'}}><FaPalette size={14} /></button>
      );
      const colorPicker = showColorPicker && (
        <div className="color-popover" style={{position:'absolute', top:36, left:6, zIndex:20, background:'#fff', border:'1px solid #2563eb', borderRadius:8, padding:8, boxShadow:'0 2px 16px rgba(0,0,0,0.10)'}}>
          <HexColorPicker color={color} onChange={c => handleColorChange(id, c)} />
          <button onClick={() => setColorPickerId(null)} style={{marginTop:4, width:'100%'}}>Close</button>
        </div>
      );
      const wrapperEvents = {
        onMouseDown,
        style: { position: 'absolute', left: x, top: y, width, height, background: 'transparent', cursor: dragging.id === id ? 'grabbing' : 'grab', zIndex: 10 },
        key: id || idx,
      };
      if (el.type === 'rectangle' || el.type === 'circle' || el.type === 'arrow' || el.type === 'line') {
        return (
          <div {...wrapperEvents}>
            {colorBtn}
            {colorPicker}
            <Shape type={el.type} x={0} y={0} width={width} height={height} color={color} stroke={stroke} strokeWidth={strokeWidth} />
          </div>
        );
      }
      if (el.type === 'sticky-note') {
        return (
          <div {...wrapperEvents} onMouseDown={e => handleElementDragStart(el, e)}>
            {colorBtn}
            {colorPicker}
            <StickyNote x={0} y={0} width={width} height={height} color={color} text={el.content?.stickyText || ''} onChange={e => handleEditText(id, e.target.value, 'sticky-note')} />
          </div>
        );
      }
      if (el.type === 'text-box') {
        return (
          <div {...wrapperEvents} onMouseDown={e => handleElementDragStart(el, e)}>
            {colorBtn}
            {colorPicker}
            <TextBox x={0} y={0} width={width} height={height} text={el.content?.textBoxText || ''} onChange={e => handleEditText(id, e.target.value, 'text-box')} color={'#fff'} bg={'transparent'} />
          </div>
        );
      }
      return null;
    });
  };

  // Polling fallback for real-time sync (every 2 seconds)
  useEffect(() => {
    if (!sessionId || joinRequired) return;
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      // Canvas
      const res = await fetch(`/api/sessions/${sessionId}/canvas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setElements(data.data.elements || []);
      }
      // Chat
      const chatRes = await fetch(`/api/sessions/${sessionId}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (chatRes.ok) {
        const data = await chatRes.json();
        setMessages((data.data.messages || []).map(normalizeMessage).sort((a, b) => b.createdAt - a.createdAt));
      }
      // Questions
      const qaRes = await fetch(`/api/sessions/${sessionId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (qaRes.ok) {
        const data = await qaRes.json();
        setQuestions((data.data.questions || []).map(normalizeQuestion).sort((a, b) => b.createdAt - a.createdAt));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId, joinRequired]);

  if (joinRequired) {
    return (
      <div className="container flex flex-col items-center justify-center" style={{minHeight: '70vh'}}>
        <div className="flex flex-col items-center mb-6" style={{width: '100%'}}>
          <span style={{fontSize: '2.2rem', color: '#FFD600', marginBottom: 4}}>🐝</span>
          <h2 className="heading-xl text-center" style={{marginBottom: 6, fontSize: '2.2rem'}}>Join Session</h2>
          <div style={{fontSize: '1.1rem', color: '#333', marginBottom: 18, textAlign: 'center', fontWeight: 500}}>
            You are not a participant in this session. Join to collaborate!
          </div>
          <form onSubmit={handleJoinSession} style={{display:'flex', flexDirection:'column', gap:12, alignItems:'center', width:320, maxWidth:'90vw'}}>
            {sessionPrivacy === 'password-protected' && (
              <input
                type="password"
                value={joinPassword}
                onChange={e => setJoinPassword(e.target.value)}
                placeholder="Session password"
                style={{width:'100%', padding:10, borderRadius:8, border:'2px solid #FFD600', fontSize:'1.1em'}}
              />
            )}
            <button type="submit" style={{width:'100%', background:'#FFD600', color:'#111', fontWeight:700, fontSize:'1.1em', borderRadius:8, border:'none', padding:12, marginTop:8}}>Join Session</button>
            {joinError && <div style={{color:'red', fontWeight:600, marginTop:8}}>{joinError}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{maxWidth: '100vw', width: '100vw', padding:0, minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      {/* Top Bar for Export, End Session, Copy Link */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: '#fffbe7',
        borderBottom: '2px solid #FFD600',
        padding: '6px 0 4px 0',
        marginBottom: 0,
        zIndex: 10,
      }}>
        <ExportPanel onExport={handleExport} />
        <button onClick={handleEndSession} style={{background:'#dc2626', color:'#fff', border:'none', borderRadius:10, padding:'5px 13px', fontWeight:700, fontSize:'0.93rem', boxShadow:'0 2px 8px #ffd60033', cursor:'pointer', minWidth:0, minHeight:0, margin:0}}>End Session</button>
        <button onClick={handleCopyLink} style={{padding:'5px 13px', borderRadius:10, border:'none', background:'#FFD600', color:'#111', fontWeight:700, fontSize:'0.93rem', boxShadow:'0 2px 8px #ffd60033', cursor:'pointer', minWidth:0, minHeight:0, margin:0}}>Copy Session Link</button>
      </div>
      <div style={{flex:1, display:'flex', flexDirection:'row', width:'100vw', minHeight:0}}>
        {/* Main Canvas Area */}
        <div style={{flex:1, minWidth:0, position:'relative', display:'flex', flexDirection:'column', height:'calc(100vh - 120px)'}}>
          {/* Canvas controls */}
          <div className="flex flex-row gap-2 mb-2" style={{padding:'8px 0 0 16px'}}>
            <button className="icon-btn" title="Rectangle" onClick={() => handleAddShape('rectangle')}><FaSquare size={22} /></button>
            <button className="icon-btn" title="Circle" onClick={() => handleAddShape('circle')}><FaCircle size={22} /></button>
            <button className="icon-btn" title="Sticky Note" onClick={() => handleAddShape('sticky')}><FaStickyNote size={22} /></button>
            <button className="icon-btn" title="Text Box" onClick={() => handleAddShape('textbox')}><FaFont size={22} /></button>
            <button className="icon-btn" title="Arrow" onClick={() => handleAddShape('arrow')}><FaLongArrowAltRight size={22} /></button>
            <button className="icon-btn bg-error" title="Delete All" onClick={handleDeleteAll}><FaTrash size={20} /></button>
            <button className="icon-btn" title="Universal Color" onClick={() => setShowUniversalColor(v => !v)}><FaPalette size={20} style={{color:universalColor}} /></button>
            {showUniversalColor && (
              <div style={{marginLeft:8, display:'flex', alignItems:'center', gap:8, background:'#222', borderRadius:8, padding:8, zIndex:30, position:'relative', boxShadow:'0 2px 16px rgba(0,0,0,0.18)'}}>
                <HexColorPicker color={universalColor} onChange={handleUniversalColorChange} style={{width:120, height:40}} />
                <button className="icon-btn" onClick={() => setShowUniversalColor(false)} style={{marginLeft:8}}>Close</button>
              </div>
            )}
          </div>
          <div style={{overflow:'auto', width:'100%', height:'100%', borderRadius:18, border:'4px solid #fff', background:'#18181b', margin:'0 auto', flex:1}}>
            {uiError && <div style={{color: 'red', fontWeight: 600, marginBottom: 8}}>{uiError}</div>}
            <Canvas
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onWheel={handleCanvasWheel}
              style={{ cursor: isPanning ? 'grabbing' : 'grab', background: 'radial-gradient(#fff 1px, transparent 1px), radial-gradient(#fff 1px, #18181b 1px)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', minHeight: 500, minWidth: 900 }}
              offset={offset}
              zoom={zoom}
            >
              <div
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  position: 'relative',
                }}
              >
                {renderElements()}
              </div>
            </Canvas>
          </div>
        </div>
        {/* Right Sidebar */}
        <div style={{width:340, minWidth:260, maxWidth:400, background:'#f8fafc', borderLeft:'2px solid #e5e7eb', display:'flex', flexDirection:'column', padding:0, height:'calc(100vh - 0px)', boxSizing:'border-box'}}>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%', height: '100%'}}>
            <Chat messages={messages} onSend={handleSendMessage} style={{flex: 1, minHeight: 0, overflowY: 'auto', width: '100%', height: '100%', borderRadius: 0, boxShadow: 'none', margin: 0, padding: 0}} />
          </div>
        </div>
      </div>
      {/* Bottom Bar for Chat and Q&A */}
      <div style={{width:'100vw', display:'flex', flexDirection:'row', gap:0, justifyContent:'center', alignItems:'flex-end', marginTop:0, paddingBottom:0, background:'#fff', borderTop:'2px solid #e5e7eb', minHeight:180}}>
        <div style={{flex:1, maxWidth:'100vw', padding:0, margin:0}}>
          <QA questions={questions} onAsk={handleAskQuestion} onAnswer={handleAnswer} style={{width:'100%', borderRadius: 0, boxShadow: 'none', margin: 0, padding: 0}} />
        </div>
      </div>
    </div>
  );
}

export default SessionBoard; 