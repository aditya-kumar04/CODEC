const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getAllUsersWithStats,
  getAllDocuments,
  getSystemStats,
  deleteUser,
  deleteDocument,
  updateUserRole,
  toggleDocumentVisibility
} = require('../controllers/adminController');

// Apply admin middleware to all routes
router.use(adminMiddleware);

// User Management
router.get('/users', getAllUsersWithStats);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Document Management
router.get('/documents', getAllDocuments);
router.delete('/documents/:id', deleteDocument);
router.put('/documents/:id/visibility', toggleDocumentVisibility);

// System Statistics
router.get('/stats', getSystemStats);

module.exports = router;
