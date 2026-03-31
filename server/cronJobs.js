const cron = require('node-cron');
const User = require('./models/User');
const Document = require('./models/Document');
const Notification = require('./models/Notification');

// Clean up expired tokens and sessions
const cleanupExpiredTokens = cron.schedule('0 2 * * *', async () => {
  console.log('🧹 Running cleanup: Expired tokens and sessions');
  try {
    // Clean up users with expired tokens
    const expiredUsers = await User.find({
      'tokenExpiry': { $lt: new Date() }
    });
    
    for (const user of expiredUsers) {
      user.token = null;
      user.tokenExpiry = null;
      await user.save();
    }
    
    console.log(`✅ Cleaned up ${expiredUsers.length} expired tokens`);
  } catch (error) {
    console.error('❌ Error cleaning up tokens:', error);
  }
}, {
  scheduled: false
});

// Clean up orphaned files (documents without actual files)
const cleanupOrphanedFiles = cron.schedule('0 3 * * 0', async () => {
  console.log('🧹 Running cleanup: Orphaned files');
  try {
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    // Get all documents in database
    const documents = await Document.find({}, 'fileName');
    const dbFiles = new Set(documents.map(doc => doc.fileName));
    
    // Get all files in uploads directory
    const fsFiles = fs.readdirSync(uploadsDir);
    
    // Find files that exist in filesystem but not in database
    const orphanedFiles = fsFiles.filter(file => !dbFiles.has(file));
    
    // Delete orphaned files
    for (const file of orphanedFiles) {
      const filePath = path.join(uploadsDir, file);
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted orphaned file: ${file}`);
    }
    
    console.log(`✅ Cleaned up ${orphanedFiles.length} orphaned files`);
  } catch (error) {
    console.error('❌ Error cleaning up orphaned files:', error);
  }
}, {
  scheduled: false
});

// Generate weekly usage statistics
const generateWeeklyStats = cron.schedule('0 9 * * 1', async () => {
  console.log('📊 Generating weekly statistics');
  try {
    const totalUsers = await User.countDocuments();
    const totalDocuments = await Document.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const stats = {
      totalUsers,
      totalDocuments,
      activeUsers,
      week: new Date().toISOString(),
      storageUsed: await calculateStorageUsage()
    };
    
    console.log('📈 Weekly Stats:', stats);
    
    // You could store this in a stats collection or send notifications
  } catch (error) {
    console.error('❌ Error generating weekly stats:', error);
  }
}, {
  scheduled: false
});

// Clean up old notifications (older than 30 days)
const cleanupOldNotifications = cron.schedule('0 1 * * *', async () => {
  console.log('🧹 Running cleanup: Old notifications');
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    console.log(`✅ Cleaned up ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
  }
}, {
  scheduled: false
});

// Helper function to calculate storage usage
async function calculateStorageUsage() {
  try {
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadsDir)) return 0;
    
    const files = fs.readdirSync(uploadsDir);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return 0;
  }
}

// Send reminder emails for inactive users
const remindInactiveUsers = cron.schedule('0 10 * * 3', async () => {
  console.log('📧 Sending reminders to inactive users');
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const inactiveUsers = await User.find({
      lastLogin: { $lt: thirtyDaysAgo },
      role: { $ne: 'Admin' }
    });
    
    console.log(`📧 Found ${inactiveUsers.length} inactive users to remind`);
    
    // Here you would integrate with an email service
    // For now, just log the users who would receive reminders
    inactiveUsers.forEach(user => {
      console.log(`📧 Reminder sent to: ${user.email}`);
    });
  } catch (error) {
    console.error('❌ Error sending reminder emails:', error);
  }
}, {
  scheduled: false
});

// Start all cron jobs
const startCronJobs = () => {
  console.log('⏰ Starting cron jobs...');
  
  cleanupExpiredTokens.start();
  cleanupOrphanedFiles.start();
  generateWeeklyStats.start();
  cleanupOldNotifications.start();
  remindInactiveUsers.start();
  
  console.log('✅ All cron jobs started successfully!');
};

// Stop all cron jobs
const stopCronJobs = () => {
  console.log('⏹️ Stopping cron jobs...');
  
  cleanupExpiredTokens.stop();
  cleanupOrphanedFiles.stop();
  generateWeeklyStats.stop();
  cleanupOldNotifications.stop();
  remindInactiveUsers.stop();
  
  console.log('✅ All cron jobs stopped!');
};

module.exports = {
  startCronJobs,
  stopCronJobs,
  cleanupExpiredTokens,
  cleanupOrphanedFiles,
  generateWeeklyStats,
  cleanupOldNotifications,
  remindInactiveUsers
};
