const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = { id: user._id, email: user.email, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, designation, employeeId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      name,
      email,
      password,
      designation: designation || 'Professor',
      employeeId: employeeId || ''
    });
    const token = generateToken(user);
    const { password: _pw, ...userData } = user.toObject();
    return res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    const { password: _pw, ...userData } = user.toObject();
    return res.status(200).json({ user: userData, token });
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
