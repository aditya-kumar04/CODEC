// server/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true }, // The public link for the frontend
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    aiSummary: { type: String, default: '' },
    extractedText: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    departmentShare: { type: Boolean, default: false },
    tags: { type: [String], default: [] }
}, { timestamps: true });

documentSchema.index({ originalName: 'text', extractedText: 'text' });

module.exports = mongoose.model('Document', documentSchema);