const mongoose = require('mongoose');

const canvasElementSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  type: {
    type: String,
    enum: ['sticky-note', 'text-box', 'rectangle', 'circle', 'arrow', 'line', 'priority-zone'],
    required: true
  },
  position: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  size: {
    width: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      default: 150
    }
  },
  content: {
    text: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#ffffff'
    },
    backgroundColor: {
      type: String,
      default: '#ffeb3b'
    },
    fontSize: {
      type: Number,
      default: 14
    },
    fontWeight: {
      type: String,
      default: 'normal'
    }
  },
  style: {
    borderColor: {
      type: String,
      default: '#000000'
    },
    borderWidth: {
      type: Number,
      default: 1
    },
    borderRadius: {
      type: Number,
      default: 0
    },
    opacity: {
      type: Number,
      default: 1
    },
    rotation: {
      type: Number,
      default: 0
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priorityZone: {
    type: String,
    enum: ['high-priority', 'medium-priority', 'low-priority', 'parking-lot', 'to-discuss', 'custom'],
    default: null
  },
  connections: [{
    targetElement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CanvasElement'
    },
    connectionType: {
      type: String,
      enum: ['line', 'arrow', 'dotted'],
      default: 'line'
    }
  }],
  isLocked: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  zIndex: {
    type: Number,
    default: 0
  },
  metadata: {
    lastModified: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true
});


canvasElementSchema.index({ sessionId: 1, type: 1 });
canvasElementSchema.index({ sessionId: 1, priorityZone: 1 });


canvasElementSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('CanvasElement', canvasElementSchema); 