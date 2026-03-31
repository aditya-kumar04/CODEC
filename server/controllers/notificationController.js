
const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'name profilePic department')
            .populate('document', 'originalName')
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Fetch Notifications Error:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user.id },
            {
                isRead: true,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Auto-delete in 24 hours after reading
            },
            { returnDocument: 'after' }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }
        res.status(200).json(notification);
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ message: 'Server error marking notification as read' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndDelete({ _id: id, recipient: req.user.id });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or unauthorized.' });
        }
        res.status(200).json({ message: 'Notification deleted successfully.' });
    } catch (error) {
        console.error('Delete Notification Error:', error);
        res.status(500).json({ message: 'Server error deleting notification' });
    }
};

module.exports = { getMyNotifications, markAsRead, deleteNotification };
