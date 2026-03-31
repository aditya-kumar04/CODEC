const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getCronStatus,
  startAllCronJobs,
  stopAllCronJobs,
  triggerCleanup
} = require('../controllers/cronController');

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Get cron job status
router.get('/status', getCronStatus);

// Start all cron jobs
router.post('/start', startAllCronJobs);

// Stop all cron jobs
router.post('/stop', stopAllCronJobs);

// Trigger manual cleanup
router.post('/cleanup/:type', triggerCleanup);

module.exports = router;
