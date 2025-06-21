const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [50, 'Title cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facilitators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['participant', 'facilitator', 'viewer'],
      default: 'participant'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  privacy: {
    type: String,
    enum: ['public', 'private', 'password-protected'],
    default: 'private'
  },
  password: {
    type: String,
    required: function() {
      return this.privacy === 'password-protected';
    }
  },
  shareableLink: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft'
  },
  template: {
    type: String,
    enum: ['blank', 'swot', 'lean-canvas', 'grid', 'user-journey'],
    default: 'blank'
  },
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: false
    },
    maxParticipants: {
      type: Number,
      default: 50
    },
    enableVoting: {
      type: Boolean,
      default: true
    },
    enableChat: {
      type: Boolean,
      default: true
    },
    enableQnA: {
      type: Boolean,
      default: true
    }
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  }
}, {
  timestamps: true
});

sessionSchema.pre('save', function(next) {
  if (!this.shareableLink) {
    this.shareableLink = `session_${this._id}_${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema); 