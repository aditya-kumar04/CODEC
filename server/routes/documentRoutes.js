const express = require('express');
const router = express.Router();
const { uploadDocuments, getMyDocuments, searchDocuments, deleteDocument, getPublicUserDocuments, toggleDocumentPrivacy, generateSummary, askDocumentQuestion, shareDocument, getSharedDocuments } = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// GET /api/documents/search - Search documents
router.get('/search', authMiddleware, searchDocuments);

// GET /api/documents/shared - Get shared with me
router.get('/shared', authMiddleware, getSharedDocuments);

// GET /api/documents/user/:userId/public - Get public documents for a user
router.get('/user/:userId/public', authMiddleware, getPublicUserDocuments);

// PATCH /api/documents/:id/privacy - Toggle document privacy
router.patch('/:id/privacy', authMiddleware, toggleDocumentPrivacy);

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', authMiddleware, deleteDocument);

// GET /api/documents - Fetch user's docs
router.get('/', authMiddleware, getMyDocuments);

// POST /api/documents/:id/summarize - Generate AI Summary
router.post('/:id/summarize', authMiddleware, generateSummary);

// POST /api/documents/:id/chat - Chat with Document
router.post('/:id/chat', authMiddleware, askDocumentQuestion);

// POST /api/documents/:id/share - Share document
router.post('/:id/share', authMiddleware, shareDocument);

// POST /api/documents/upload - WITH DIAGNOSTIC SPOTLIGHT
router.post('/upload', authMiddleware, (req, res) => {
    console.log('--- 🚀 NEW UPLOAD REQUEST STARTED ---');

    // 1. We manually run Multer so we can catch its specific errors
    upload.array('files', 10)(req, res, function (err) {
        if (err) {
            // If Multer is the one crashing, it will print in bright red right here!
            console.error('💥 MULTER CRASHED:', err);
            return res.status(500).json({ message: 'File rejected by Multer', error: err.message });
        }

        // 2. If Multer succeeds, we check if it actually grabbed the file
        console.log('✅ Multer successfully processed the request.');
        console.log('📁 Files received count:', req.files ? req.files.length : 'UNDEFINED!');

        if (!req.files || req.files.length === 0) {
            console.log('⚠️ WARNING: Multer finished, but no files were found in the request.');
        }

        // 3. Now we manually pass it to your controller
        console.log('🧠 Passing to Controller...');
        uploadDocuments(req, res).catch(controllerErr => {
            console.error('💥 CONTROLLER CRASHED:', controllerErr);
            res.status(500).json({ message: 'Database save failed', error: controllerErr.message });
        });
    });
});

module.exports = router;
