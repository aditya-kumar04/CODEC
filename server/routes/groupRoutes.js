
const express = require('express');
const router = express.Router();
const { createGroup, getMyGroups, addMembersToGroup, promoteToAdmin, deleteGroup } = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createGroup);
router.get('/', authMiddleware, getMyGroups);
router.post('/:groupId/members', authMiddleware, addMembersToGroup);
router.put('/:groupId/admins', authMiddleware, promoteToAdmin);
router.delete('/:groupId', authMiddleware, deleteGroup);

module.exports = router;
