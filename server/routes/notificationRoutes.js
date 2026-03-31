
const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getMyNotifications);
router.patch('/:id/read', authMiddleware, markAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

module.exports = router;
