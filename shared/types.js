
const ElementTypes = Object.freeze({
  STICKY_NOTE: 'sticky-note',
  TEXT_BOX: 'text-box',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  ARROW: 'arrow',
  LINE: 'line',
  PRIORITY_ZONE: 'priority-zone'
});

const SessionStatus = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
});

const UserRoles = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
  FACILITATOR: 'facilitator',
  PARTICIPANT: 'participant',
  VIEWER: 'viewer'
});

const PriorityZones = Object.freeze({
  HIGH: 'high-priority',
  MEDIUM: 'medium-priority',
  LOW: 'low-priority',
  PARKING_LOT: 'parking-lot',
  TO_DISCUSS: 'to-discuss',
  CUSTOM: 'custom'
});

const QuestionStatus = Object.freeze({
  PENDING: 'pending',
  ANSWERED: 'answered',
  ARCHIVED: 'archived'
});

const MessageTypes = Object.freeze({
  TEXT: 'text',
  SYSTEM: 'system',
  NOTIFICATION: 'notification'
});

module.exports = {
  ElementTypes,
  SessionStatus,
  UserRoles,
  PriorityZones,
  QuestionStatus,
  MessageTypes
};
