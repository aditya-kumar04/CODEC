const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, getMe, updateMe } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);

router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);

module.exports = router;
