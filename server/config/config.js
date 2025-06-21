require('dotenv').config({ path: __dirname + '/../.env' });
let allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
if (allowedOrigins.length === 0) {
  // Fallback: allow all origins in development
  allowedOrigins = [/.*/];
  console.warn('CORS_ORIGIN not set. Allowing all origins for development.');
}
const config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  CORS_ORIGIN: allowedOrigins,
  SOCKET_CORS: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  },
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
  SESSION_SECRET: process.env.SESSION_SECRET,
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : undefined
};

module.exports = config; 