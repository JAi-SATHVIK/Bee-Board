const mongoose = require('mongoose');

const sessionActivitySchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'element_created',
      'element_updated',
      'element_deleted',
      'element_moved',
      'element_resized',
      'vote_added',
      'vote_removed',
      'connection_created',
      'connection_deleted',
      'chat_message_sent',
      'chat_message_edited',
      'chat_message_deleted',
      'question_submitted',
      'question_upvoted',
      'question_answered',
      'session_joined',
      'session_left',
      'timer_started',
      'timer_stopped',
      'board_locked',
      'board_unlocked',
      'template_loaded',
      'priority_zone_created',
      'priority_zone_deleted',
      'session_created'
    ],
    required: true
  },
  targetType: {
    type: String,
    enum: ['canvas_element', 'chat_message', 'question', 'session', 'timer', 'template', 'priority_zone'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    clientId: String,
    userAgent: String,
    ipAddress: String,
    sessionVersion: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
sessionActivitySchema.index({ sessionId: 1, timestamp: 1 });
sessionActivitySchema.index({ sessionId: 1, user: 1 });
sessionActivitySchema.index({ sessionId: 1, action: 1 });
sessionActivitySchema.index({ timestamp: 1 });

// Method to get session timeline
sessionActivitySchema.statics.getSessionTimeline = function(sessionId, options = {}) {
  const query = { sessionId };
  
  if (options.startTime) {
    query.timestamp = { $gte: options.startTime };
  }
  
  if (options.endTime) {
    query.timestamp = { ...query.timestamp, $lte: options.endTime };
  }
  
  if (options.actions) {
    query.action = { $in: options.actions };
  }
  
  return this.find(query)
    .sort({ timestamp: 1 })
    .populate('user', 'username avatar')
    .populate('targetId')
    .limit(options.limit || 1000);
};

// Method to get user activity summary
sessionActivitySchema.statics.getUserActivitySummary = function(sessionId, userId) {
  return this.aggregate([
    { $match: { sessionId: mongoose.Types.ObjectId(sessionId), user: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: '$action',
      count: { $sum: 1 },
      lastActivity: { $max: '$timestamp' }
    }},
    { $sort: { lastActivity: -1 } }
  ]);
};

module.exports = mongoose.model('SessionActivity', sessionActivitySchema); 