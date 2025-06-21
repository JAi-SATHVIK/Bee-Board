const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config/config');
const { connectDB } = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { initSocket } = require('./sockets');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

connectDB();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || config.CORS_ORIGIN.some(o => (typeof o === 'string' ? o === origin : o.test(origin)))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(errorHandler);

const io = initSocket(server);

const PORT = config.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
