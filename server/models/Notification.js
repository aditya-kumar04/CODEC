
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null, index: { expires: '0s' } },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
