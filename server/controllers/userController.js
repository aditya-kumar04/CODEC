const User = require('../models/User');
const Document = require('../models/Document');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Get User By ID Error:', error);
        res.status(500).json({ message: 'Server error fetching user' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalUploads = await Document.countDocuments({ uploader: req.user.id });
        const publicFiles = await Document.countDocuments({ uploader: req.user.id, isPublic: true });

        res.status(200).json({
            user,
            stats: {
                totalUploads,
                publicFiles
            }
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server error fetching user profile' });
    }
};

const updateMe = async (req, res) => {
    try {
        const { name, profilePic, department, designation, bio, employeeId } = req.body;

        // Build an object with only the allowed fields to update
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (profilePic !== undefined) updateFields.profilePic = profilePic;
        if (department !== undefined) updateFields.department = department;
        if (designation !== undefined) updateFields.designation = designation;
        if (bio !== undefined) updateFields.bio = bio;
        if (employeeId !== undefined) updateFields.employeeId = employeeId;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { returnDocument: 'after', runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update Me Error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

module.exports = { getAllUsers, getUserById, getMe, updateMe };
