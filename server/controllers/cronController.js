const { startCronJobs, stopCronJobs } = require('../cronJobs');

// Get cron job status
const getCronStatus = (req, res) => {
  try {
    const cron = require('node-cron');
    const scheduledTasks = cron.getTasks();
    
    const tasks = [];
    scheduledTasks.forEach((task, name) => {
      tasks.push({
        name,
        running: task.getStatus() === 'scheduled',
        nextRun: task.getNextRun(),
        lastRun: task.getLastRun()
      });
    });
    
    res.status(200).json({
      message: 'Cron job status retrieved successfully',
      tasks,
      totalTasks: tasks.length
    });
  } catch (error) {
    console.error('Error getting cron status:', error);
    res.status(500).json({ message: 'Failed to get cron status' });
  }
};

// Start all cron jobs
const startAllCronJobs = (req, res) => {
  try {
    startCronJobs();
    res.status(200).json({ message: 'All cron jobs started successfully' });
  } catch (error) {
    console.error('Error starting cron jobs:', error);
    res.status(500).json({ message: 'Failed to start cron jobs' });
  }
};

// Stop all cron jobs
const stopAllCronJobs = (req, res) => {
  try {
    stopCronJobs();
    res.status(200).json({ message: 'All cron jobs stopped successfully' });
  } catch (error) {
    console.error('Error stopping cron jobs:', error);
    res.status(500).json({ message: 'Failed to stop cron jobs' });
  }
};

// Manually trigger a specific cleanup
const triggerCleanup = async (req, res) => {
  try {
    const { type } = req.params;
    const { cleanupExpiredTokens, cleanupOrphanedFiles, cleanupOldNotifications } = require('../cronJobs');
    
    let result;
    switch (type) {
      case 'tokens':
        await cleanupExpiredTokens.run();
        result = 'Token cleanup completed';
        break;
      case 'files':
        await cleanupOrphanedFiles.run();
        result = 'Orphaned files cleanup completed';
        break;
      case 'notifications':
        await cleanupOldNotifications.run();
        result = 'Old notifications cleanup completed';
        break;
      default:
        return res.status(400).json({ message: 'Invalid cleanup type' });
    }
    
    res.status(200).json({ message: result });
  } catch (error) {
    console.error('Error triggering cleanup:', error);
    res.status(500).json({ message: 'Failed to trigger cleanup' });
  }
};

module.exports = {
  getCronStatus,
  startAllCronJobs,
  stopAllCronJobs,
  triggerCleanup
};
