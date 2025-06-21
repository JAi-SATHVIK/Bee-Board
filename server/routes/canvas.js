const express = require('express');
const router = express.Router({ mergeParams: true });
const canvasController = require('../controllers/canvasController');
const { authenticate } = require('../middleware/authMiddleware');


router.get('/', authenticate, canvasController.getCanvasElements);

router.post('/', authenticate, canvasController.createCanvasElement);

router.put('/:elementId', authenticate, canvasController.updateCanvasElement);

router.delete('/:elementId', authenticate, canvasController.deleteCanvasElement);

router.post('/:elementId/vote', authenticate, canvasController.voteOnElement);

router.put('/:elementId/priority', authenticate, canvasController.moveToPriorityZone);

router.delete('/', authenticate, canvasController.deleteAllCanvasElements);

module.exports = router; 