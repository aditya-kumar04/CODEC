const User = require('../models/User');
const Document = require('../models/Document');

// Get all users with their stats
const getAllUsersWithStats = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    
    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalUploads = await Document.countDocuments({ uploader: user._id });
        const publicFiles = await Document.countDocuments({ uploader: user._id, isPublic: true });
        const privateFiles = await Document.countDocuments({ uploader: user._id, isPublic: false });
        const totalSize = await Document.aggregate([
          { $match: { uploader: user._id } },
          { $group: { _id: null, totalSize: { $sum: '$size' } } }
        ]);
        
        return {
          ...user,
          stats: {
            totalUploads,
            publicFiles,
            privateFiles,
            totalSize: totalSize[0]?.totalSize || 0
          }
        };
      })
    );

    res.status(200).json(usersWithStats);
  } catch (error) {
    console.error('Get All Users With Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Get all documents with uploader info
const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('uploader', 'name email department designation')
      .sort({ createdAt: -1 });
    
    res.status(200).json(documents);
  } catch (error) {
    console.error('Get All Documents Error:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'Admin' });
    const totalProfessors = await User.countDocuments({ role: 'Professor' });
    const totalDocuments = await Document.countDocuments();
    const publicDocuments = await Document.countDocuments({ isPublic: true });
    const privateDocuments = await Document.countDocuments({ isPublic: false });
    
    // Storage stats
    const storageStats = await Document.aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$size' },
          avgSize: { $avg: '$size' }
        }
      }
    ]);

    // Recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUploads = await Document.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // File type distribution
    const fileTypeStats = await Document.aggregate([
      {
        $group: {
          _id: '$mimeType',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    res.status(200).json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        professors: totalProfessors
      },
      documents: {
        total: totalDocuments,
        public: publicDocuments,
        private: privateDocuments,
        recent: recentUploads
      },
      storage: {
        totalSize: storageStats[0]?.totalSize || 0,
        avgSize: storageStats[0]?.avgSize || 0
      },
      fileTypes: fileTypeStats
    });
  } catch (error) {
    console.error('Get System Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching system stats' });
  }
};

// Delete user and all their documents
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Don't allow admin to delete themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all documents belonging to the user
    await Document.deleteMany({ uploader: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ 
      message: 'User and all their documents deleted successfully',
      deletedUser: user
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete the document
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      message: 'Document deleted successfully',
      deletedDocument: document
    });
  } catch (error) {
    console.error('Delete Document Error:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['Professor', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const userId = req.params.id;
    
    // Don't allow admin to change their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update User Role Error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

// Toggle document visibility (public/private)
const toggleDocumentVisibility = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.isPublic = !document.isPublic;
    await document.save();

    res.status(200).json({
      message: `Document is now ${document.isPublic ? 'public' : 'private'}`,
      document
    });
  } catch (error) {
    console.error('Toggle Document Visibility Error:', error);
    res.status(500).json({ message: 'Server error toggling document visibility' });
  }
};

module.exports = {
  getAllUsersWithStats,
  getAllDocuments,
  getSystemStats,
  deleteUser,
  deleteDocument,
  updateUserRole,
  toggleDocumentVisibility
};
