const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/sessions', require('./sessions'));
router.use('/sessions/:sessionId/canvas', require('./canvas'));

module.exports = router; 