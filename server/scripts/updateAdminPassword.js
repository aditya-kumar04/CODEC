const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const updateAdminPassword = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find existing admin
    const admin = await User.findOne({ email: 'admin@codec.com' });
    if (!admin) {
      console.log('Admin user not found');
      process.exit(1);
    }

    // Update password (let the pre-save hook handle hashing)
    admin.password = 'ADmin@123456';
    await admin.save();

    console.log('Admin password updated successfully:');
    console.log('Email: admin@codec.com');
    console.log('New Password: ADmin@123456');
    console.log('Role: Admin');

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
};

updateAdminPassword();
