const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@codec.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@codec.com',
      password: 'ADmin@123456',
      role: 'Admin',
      designation: 'System Administrator',
      department: 'IT',
      employeeId: 'ADMIN001'
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@codec.com');
    console.log('Password: ADmin@123456');
    console.log('Role: Admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
