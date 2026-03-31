const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('../server/config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
const uploadsDir = path.join(__dirname, '../server/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Database Connection
connectDB();

// Import routes
const authRoutes = require('../server/routes/authRoutes');
const documentRoutes = require('../server/routes/documentRoutes');
const userRoutes = require('../server/routes/userRoutes');
const adminRoutes = require('../server/routes/adminRoutes');
const notificationRoutes = require('../server/routes/notificationRoutes');
const groupRoutes = require('../server/routes/groupRoutes');

// Mount routes
app.use('/api', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/groups', groupRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;
