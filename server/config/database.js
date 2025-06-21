const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Database disconnection error:', error.message);
  }
};

module.exports = { connectDB, disconnectDB }; 