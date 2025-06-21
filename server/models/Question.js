const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question content is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'archived'],
    default: 'pending'
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  answers: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answer: {
      type: String,
      required: [true, 'Answer content is required'],
      trim: true,
      maxlength: [1000, 'Answer cannot exceed 1000 characters']
    },
    isAccepted: {
      type: Boolean,
      default: false
    },
    upvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  answeredAt: {
    type: Date
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'process', 'clarification', 'suggestion'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});


questionSchema.index({ sessionId: 1, status: 1 });
questionSchema.index({ sessionId: 1, 'upvotes.user': 1 });
questionSchema.index({ sessionId: 1, category: 1 });
questionSchema.index({ sessionId: 1, priority: 1 });


questionSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});


questionSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});


questionSchema.set('toJSON', { virtuals: true });


questionSchema.methods.addUpvote = function(userId) {
  const existingUpvote = this.upvotes.find(vote => vote.user.toString() === userId.toString());
  const existingDownvote = this.downvotes.find(vote => vote.user.toString() === userId.toString());
  
  if (existingDownvote) {
    this.downvotes = this.downvotes.filter(vote => vote.user.toString() !== userId.toString());
  }
  
  if (!existingUpvote) {
    this.upvotes.push({ user: userId });
  }
  
  return this.save();
};


questionSchema.methods.addDownvote = function(userId) {
  const existingUpvote = this.upvotes.find(vote => vote.user.toString() === userId.toString());
  const existingDownvote = this.downvotes.find(vote => vote.user.toString() === userId.toString());
  
  if (existingUpvote) {
    this.upvotes = this.upvotes.filter(vote => vote.user.toString() !== userId.toString());
  }
  
  if (!existingDownvote) {
    this.downvotes.push({ user: userId });
  }
  
  return this.save();
};

module.exports = mongoose.model('Question', questionSchema); 