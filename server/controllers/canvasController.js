const { CanvasElement, Session, SessionActivity } = require('../models');
const { getIO } = require('../sockets');

const getCanvasElements = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const hasAccess = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId)) ||
      session.participants.some(p => p.user.equals(userId));

    if (!hasAccess && (session.privacy === 'private' || session.privacy === 'password-protected')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const elements = await CanvasElement.find({ sessionId })
      .populate('creator', 'username avatar')
      .sort({ zIndex: 1, createdAt: 1 });

    res.json({
      success: true,
      data: { elements }
    });
  } catch (error) {
    console.error('Get canvas elements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const createCanvasElement = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    const elementData = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const hasAccess = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId)) ||
      session.participants.some(p => p.user.equals(userId));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const element = await CanvasElement.create({
      ...elementData,
      sessionId,
      creator: userId
    });

    await element.populate('creator', 'username avatar');

    await SessionActivity.create({
      sessionId,
      user: userId,
      action: 'element_created',
      targetType: 'canvas_element',
      targetId: element._id,
      data: { elementType: element.type }
    });

    // Emit real-time update
    const io = getIO();
    io.to(sessionId).emit('canvas-action', { action: 'add', payload: element });

    res.status(201).json({
      success: true,
      message: 'Canvas element created successfully',
      data: { element }
    });
  } catch (error) {
    console.error('Create canvas element error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const updateCanvasElement = async (req, res) => {
  try {
    const { sessionId, elementId } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const hasAccess = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId)) ||
      session.participants.some(p => p.user.equals(userId));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const element = await CanvasElement.findById(elementId);
    if (!element) {
      return res.status(404).json({
        success: false,
        message: 'Canvas element not found'
      });
    }

    if (element.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'Element is locked and cannot be modified'
      });
    }

    Object.assign(element, updateData);
    element.metadata.lastModified = new Date();
    element.metadata.modifiedBy = userId;
    element.metadata.version += 1;

    await element.save();

    await element.populate('creator', 'username avatar');

    await SessionActivity.create({
      sessionId,
      user: userId,
      action: 'element_updated',
      targetType: 'canvas_element',
      targetId: element._id,
      data: { elementType: element.type }
    });

    // Emit real-time update
    const io = getIO();
    io.to(sessionId).emit('canvas-action', { action: 'update', payload: element });

    res.json({
      success: true,
      message: 'Canvas element updated successfully',
      data: { element }
    });
  } catch (error) {
    console.error('Update canvas element error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteCanvasElement = async (req, res) => {
  try {
    const { sessionId, elementId } = req.params;
    const userId = req.user.userId;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const hasAccess = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId)) ||
      session.participants.some(p => p.user.equals(userId));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const element = await CanvasElement.findById(elementId);
    if (!element) {
      return res.status(404).json({
        success: false,
        message: 'Canvas element not found'
      });
    }

    await element.remove();

    await SessionActivity.create({
      sessionId,
      user: userId,
      action: 'element_deleted',
      targetType: 'canvas_element',
      targetId: elementId,
      data: { elementType: element.type }
    });

    // Emit real-time update
    const io = getIO();
    io.to(sessionId).emit('canvas-action', { action: 'delete', payload: { _id: elementId } });

    res.json({
      success: true,
      message: 'Canvas element deleted successfully'
    });
  } catch (error) {
    console.error('Delete canvas element error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const voteOnElement = async (req, res) => {
  try {
    const { sessionId, elementId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.userId;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const hasAccess = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId)) ||
      session.participants.some(p => p.user.equals(userId));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!session.settings.enableVoting) {
      return res.status(400).json({
        success: false,
        message: 'Voting is disabled for this session'
      });
    }

    const element = await CanvasElement.findById(elementId);
    if (!element) {
      return res.status(404).json({
        success: false,
        message: 'Canvas element not found'
      });
    }

    if (voteType === 'upvote') {
      await element.addUpvote(userId);
    } else if (voteType === 'downvote') {
      await element.addDownvote(userId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }

    await element.populate('votes.upvotes.user', 'username avatar');
    await element.populate('votes.downvotes.user', 'username avatar');

    await SessionActivity.create({
      sessionId,
      user: userId,
      action: 'vote_added',
      targetType: 'canvas_element',
      targetId: element._id,
      data: { voteType, elementType: element.type }
    });

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: { element }
    });
  } catch (error) {
    console.error('Vote on element error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const moveToPriorityZone = async (req, res) => {
  try {
    const { sessionId, elementId } = req.params;
    const { priorityZone } = req.body;
    const userId = req.user.userId;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const hasAccess = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId)) ||
      session.participants.some(p => p.user.equals(userId));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const element = await CanvasElement.findById(elementId);
    if (!element) {
      return res.status(404).json({
        success: false,
        message: 'Canvas element not found'
      });
    }

    element.priorityZone = priorityZone;
    element.metadata.lastModified = new Date();
    element.metadata.modifiedBy = userId;
    element.metadata.version += 1;

    await element.save();

    await SessionActivity.create({
      sessionId,
      user: userId,
      action: 'element_moved',
      targetType: 'canvas_element',
      targetId: element._id,
      data: { priorityZone, elementType: element.type }
    });

    res.json({
      success: true,
      message: 'Element moved to priority zone successfully',
      data: { element }
    });
  } catch (error) {
    console.error('Move to priority zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteAllCanvasElements = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    const hasAccess = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId)) ||
      session.participants.some(p => p.user.equals(userId));
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await CanvasElement.deleteMany({ sessionId });
    const io = getIO();
    io.to(sessionId).emit('canvas-action', { action: 'deleteAll' });
    res.json({ success: true, message: 'All canvas elements deleted' });
  } catch (error) {
    console.error('Delete all canvas elements error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCanvasElements,
  createCanvasElement,
  updateCanvasElement,
  deleteCanvasElement,
  voteOnElement,
  moveToPriorityZone,
  deleteAllCanvasElements
};