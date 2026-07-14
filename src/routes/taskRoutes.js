// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, taskController.getTasks);
router.post('/complete', authMiddleware, taskController.completeTask);

module.exports = router;