const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const { startCronJobs } = require('./cronJobs');

// Load environment variables
dotenv.config();

const app = express();

// 1. Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Static File Serving (The Uploads Folder)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// 3. Database Connection
connectDB();

// 4. Start Cron Jobs
startCronJobs();

// 5. Mount Routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const groupRoutes = require('./routes/groupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cronRoutes = require('./routes/cronRoutes');

app.use('/api', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cron', cronRoutes);

// 5. Start Server
const PORT = process.env.PORT || 5050;

app.use((err, req, res, next) => {
  console.error('💥 FATAL SERVER ERROR CAUGHT:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is officially running on port ${PORT}`);
  console.log(`📁 Server Root: ${__dirname}`);
  console.log(`✅ File Uploads mapped to: ${uploadsDir}`);
});