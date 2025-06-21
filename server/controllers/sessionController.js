const { Session, User, SessionActivity } = require('../models');


const createSession = async (req, res) => {
  try {
    const { title, description, privacy, password, template, settings } = req.body;
    const creatorId = req.user.userId;

  
    const session = await Session.create({
      title,
      description,
      creator: creatorId,
      facilitators: [creatorId],
      privacy,
      password,
      template,
      settings
    });

    session.participants.push({
      user: creatorId,
      role: 'facilitator'
    });

    await session.save();

  
    await SessionActivity.create({
      sessionId: session._id,
      user: creatorId,
      action: 'session_created',
      targetType: 'session',
      targetId: session._id
    });


    await session.populate('creator', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { creator: userId },
        { facilitators: userId },
        { 'participants.user': userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('creator', 'username avatar')
      .populate('facilitators', 'username avatar')
      .populate('participants.user', 'username avatar')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      data: {
        sessions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const session = await Session.findById(id)
      .populate('creator', 'username avatar')
      .populate('facilitators', 'username avatar')
      .populate('participants.user', 'username avatar');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }


    const hasAccess = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId)) ||
      session.participants.some(p => p.user._id.equals(userId));

    if (!hasAccess && (session.privacy === 'private' || session.privacy === 'password-protected')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        privacy: session.privacy
      });
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const joinSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const userId = req.user.userId;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

   
    if (session.status !== 'active' && session.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Session is not available for joining'
      });
    }

    
    if (session.privacy === 'password-protected') {
      if (!password || password !== session.password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }
    }

    const isAlreadyParticipant = session.participants.some(p => p.user.equals(userId));
    if (isAlreadyParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Already a participant in this session'
      });
    }

    if (session.participants.length >= session.settings.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Session is full'
      });
    }

    session.participants.push({
      user: userId,
      role: 'participant'
    });

    await session.save();

    
    await SessionActivity.create({
      sessionId: session._id,
      user: userId,
      action: 'session_joined',
      targetType: 'session',
      targetId: session._id
    });

    res.json({
      success: true,
      message: 'Joined session successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const isAuthorized = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId));

    if (!isAuthorized) {
      return res.status(403).json ({
        success: false,
        message: 'Not authorized to update this session'
      });
    }

   
    const updatedSession = await Session.findByIdAndUpdate(
      id,
      updateData,
      {  new: true, runValidators: true }
    ).populate('creator', 'username avatar')
     .populate('facilitators', 'username avatar')
     .populate('participants.user', 'username avatar');

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: { session: updatedSession }
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const startSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    
    const isAuthorized = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this session'
      });
    }

    
    session.status = 'active';
    session.startedAt = new Date();
    await session.save();

    
    await SessionActivity.create({
      sessionId: session._id,
      user: userId,
      action: 'session_started',
      targetType: 'session',
      targetId: session._id
    });

    res.json({
      success: true,
      message: 'Session started successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    
    const isAuthorized = session.creator.equals(userId) ||
      session.facilitators.some(f => f._id.equals(userId));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this session'
      });
    }

    
    session.status = 'completed';
    session.endedAt = new Date();
    await session.save();

    
    await SessionActivity.create({
      sessionId: session._id,
      user: userId,
      action: 'session_ended',
      targetType: 'session',
      targetId: session._id
    });

    res.json({
      success: true,
      message: 'Session ended successfully',
      data: { session }
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    
    if (!session.creator.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can delete this session'
      });
    }

    await Session.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSession,
  joinSession,
  updateSession,
  startSession,
  endSession,
  deleteSession
}; 