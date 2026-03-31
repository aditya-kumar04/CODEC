// server/controllers/documentController.js
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Group = require('../models/Group');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const officeParser = require('officeparser');
const xlsx = require('xlsx');
const sharp = require('sharp');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Upload new documents
const uploadDocuments = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        // Extract tags from request body
        let tagsArray = [];
        if (req.body.tags) {
            tagsArray = req.body.tags.split(',').map(tag => tag.trim().toLowerCase());
        }

        const savedDocuments = [];

        // Loop through all uploaded files and save them to MongoDB
        for (let file of req.files) {
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            let fileText = '';

            // Normalize mimetype and extension for cleaner checks
            const mime = file.mimetype || '';
            const lowerName = file.originalname.toLowerCase();

            try {
                // Condition A: PDFs
                if (mime === 'application/pdf') {
                    const dataBuffer = fs.readFileSync(file.path);
                    const data = await pdfParse(dataBuffer);
                    fileText = data.text;
                }
                // Condition B: Excel (XLS, XLSX) - Robust handling with CSV fallback
                else if (
                    mime.includes('excel') ||
                    mime.includes('spreadsheet') ||
                    lowerName.endsWith('.xls') ||
                    lowerName.endsWith('.xlsx')
                ) {
                    const workbook = xlsx.readFile(file.path);
                    let sheetText = '';
                    workbook.SheetNames.forEach(sheetName => {
                        const sheet = workbook.Sheets[sheetName];
                        // Using sheet_to_csv ensures we get all cell values clearly separated
                        const txt = xlsx.utils.sheet_to_csv(sheet);
                        if (txt) sheetText += txt + ' ';
                    });
                    fileText = sheetText;
                }
                // Condition C: Microsoft Office (Word, PPT)
                else if (
                    mime.includes('officedocument') ||
                    mime.includes('msword') ||
                    mime.includes('ms-powerpoint') ||
                    mime.includes('presentation')
                ) {
                    fileText = await officeParser.parseOfficeAsync(file.path);
                }
                // Condition D: Images (OCR with Sharp Preprocessing)
                else if (mime.startsWith('image/')) {
                    // Preprocess image: Resize (upscale 2x for small text), Grayscale, Normalize
                    const metadata = await sharp(file.path).metadata();

                    // Only upscale if width is less than 2500px to avoid memory issues on huge images
                    let pipeline = sharp(file.path);
                    if (metadata.width && metadata.width < 2500) {
                        pipeline = pipeline.resize({ width: Math.round(metadata.width * 2) });
                    }

                    const processedBuffer = await pipeline
                        .grayscale()
                        .normalize() // Enhances contrast
                        .toBuffer();

                    const { data: { text } } = await Tesseract.recognize(processedBuffer, 'eng');
                    fileText = text;
                }
                // Condition E: Text, Code, & Data
                else if (
                    mime.startsWith('text/') ||
                    mime.includes('json') ||
                    mime.includes('javascript') ||
                    mime.includes('x-python') ||
                    lowerName.endsWith('.md') ||
                    lowerName.endsWith('.js') ||
                    lowerName.endsWith('.py') ||
                    lowerName.endsWith('.cpp') ||
                    lowerName.endsWith('.csv') ||
                    lowerName.endsWith('.txt')
                ) {
                    fileText = fs.readFileSync(file.path, 'utf8');
                }
                // Condition E: Fallback (matches none) -> fileText remains ''

            } catch (err) {
                console.error(`Text extraction failed for ${file.originalname}:`, err.message);
                // We intentionally swallow the error so the file is still uploaded, just without searchable text.
            }

            const newDoc = await Document.create({
                originalName: file.originalname,
                fileName: file.filename,
                fileUrl: fileUrl,
                mimeType: mime || 'application/octet-stream',
                size: file.size,
                uploader: req.user.id, // Taken from the authMiddleware
                extractedText: fileText,
                tags: tagsArray
            });

            savedDocuments.push(newDoc);
        }

        res.status(201).json(savedDocuments);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server error during upload', error: error.message });
    }
};

// 2. Get documents for the logged-in user
const getMyDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ uploader: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(documents);
    } catch (error) {
        console.error('Fetch Documents Error:', error);
        res.status(500).json({ message: 'Server error fetching documents' });
    }
};

// 3. Search documents
const searchDocuments = async (req, res) => {
    try {
        console.log("Search Query Params:", req.query);
        const { q, tags, time, privacy } = req.query;

        // Base Query: Strictly the logged-in user's documents
        let query = { uploader: req.user.id };

        // Privacy Filter Logic
        if (privacy === 'public') query.isPublic = true;
        if (privacy === 'private') query.isPublic = false;

        if (q) {
            // Partial matching on name or content
            query.$or = [
                { originalName: { $regex: q, $options: 'i' } },
                { extractedText: { $regex: q, $options: 'i' } }
            ];
        }

        if (tags) {
            query.tags = { $in: tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0) };
        }

        if (time && time !== 'all') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(time));
            query.createdAt = { $gte: cutoff };
        }

        const documents = await Document.find(query).sort({ createdAt: -1 });
        res.status(200).json(documents);
    } catch (error) {
        console.error('Search Documents Error:', error);
        res.status(500).json({ message: 'Server error searching documents' });
    }
};

// 4. Delete document
const deleteDocument = async (req, res) => {
    try {
        const documentId = req.params.id;

        // Security Check: Find the document ensuring it belongs to the logged-in user
        const document = await Document.findOne({ _id: documentId, uploader: req.user.id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found or unauthorized to delete.' });
        }

        // Physical Deletion
        const path = require('path');
        const filePath = path.join(__dirname, '../uploads', document.fileName);

        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (fileErr) {
            console.error('File deletion error:', fileErr);
            // We don't crash here; if the file is already missing, we still want to delete the DB record
        }

        // Database Deletion
        await Document.findByIdAndDelete(documentId);

        res.status(200).json({ message: 'Document successfully deleted.' });
    } catch (error) {
        console.error('Delete Document Error:', error);
        res.status(500).json({ message: 'Server error deleting document' });
    }
};

// 5. Get public documents for a specific user
const getPublicUserDocuments = async (req, res) => {
    try {
        const { userId } = req.params;
        const { q } = req.query;

        let query = { uploader: userId, isPublic: true };

        if (q) {
            query.$or = [
                { originalName: { $regex: q, $options: 'i' } },
                { extractedText: { $regex: q, $options: 'i' } }
            ];
        }

        const documents = await Document.find(query).sort({ createdAt: -1 });
        res.status(200).json(documents);
    } catch (error) {
        console.error('Get Public User Documents Error:', error);
        res.status(500).json({ message: 'Server error fetching public documents' });
    }
};

// 6. Toggle document privacy
const toggleDocumentPrivacy = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublic } = req.body;

        // Security Check: Ensure only the owner can change privacy
        const document = await Document.findOne({ _id: id, uploader: req.user.id });

        if (!document) {
            return res.status(404).json({ message: 'Document not found or unauthorized.' });
        }

        document.isPublic = isPublic;
        await document.save();

        res.status(200).json(document);
    } catch (error) {
        console.error('Toggle Privacy Error:', error);
        res.status(500).json({ message: 'Server error updating document privacy' });
    }
};

// 7. Generate AI Summary
const generateSummary = async (req, res) => {
    try {
        const { id } = req.params;

        // Find document and populate uploader to check department
        const document = await Document.findById(id).populate('uploader');
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Security Check: Owner OR Public OR SharedWith OR DeptShared
        const user = await User.findById(req.user.id);
        const isOwner = document.uploader._id.toString() === req.user.id;
        const isShared = document.sharedWith.includes(req.user.id);
        const isDeptShared = document.departmentShare && document.uploader.department === user?.department;

        if (!isOwner && !document.isPublic && !isShared && !isDeptShared) {
            return res.status(403).json({ message: 'Access denied to this document.' });
        }

        // Return existing summary if available
        if (document.aiSummary) {
            return res.status(200).json({ summary: document.aiSummary });
        }

        // Check for extracted text
        if (!document.extractedText || document.extractedText.trim().length === 0) {
            return res.status(400).json({ message: 'No text available to summarize' });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use 'gemini-flash-latest' for better compatibility with different API keys
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `You are an academic assistant. Please provide a clear, professional, and concise summary of the following document. Use bullet points for key findings. Document Text: ${document.extractedText}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summaryText = response.text();

        // Save and return
        document.aiSummary = summaryText;
        await document.save();

        res.status(200).json({ summary: summaryText });
    } catch (error) {
        console.error('AI Summary Error:', error);

        // Check for specific SDK errors
        const errorMessage = error.message || 'Server error generating summary';
        res.status(500).json({
            message: 'Gemini AI failed to generate summary',
            details: errorMessage,
            error: error.name
        });
    }
};

// 8. Chat with Document (Q&A)
const askDocumentQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }

        // Find document and populate uploader to check department
        const document = await Document.findById(id).populate('uploader');
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Security Check: Owner OR Public OR SharedWith OR DeptShared
        const user = await User.findById(req.user.id);
        const isOwner = document.uploader._id.toString() === req.user.id;
        const isShared = document.sharedWith.includes(req.user.id);
        const isDeptShared = document.departmentShare && document.uploader.department === user?.department;

        if (!isOwner && !document.isPublic && !isShared && !isDeptShared) {
            return res.status(403).json({ message: 'Access denied to this document.' });
        }

        // Validation: Ensure text exists
        if (!document.extractedText || document.extractedText.trim().length === 0) {
            return res.status(400).json({ message: 'No text available to analyze for this document.' });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use 'gemini-flash-latest' for better compatibility with different API keys
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Strict Academic Prompt
        const prompt = `You are an academic AI assistant helping a professor analyze a document. Answer the user's question based strictly on the provided document text. If the answer is not in the text, say so. \n\nDocument Text: ${document.extractedText}\n\nQuestion: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answerText = response.text();

        res.status(200).json({ answer: answerText });
    } catch (error) {
        console.error('Document Q&A Error:', error);
        res.status(500).json({
            message: 'Failed to get answer from AI',
            details: error.message
        });
    }
};

// 9. Share document
const shareDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetUserId, targetGroupId, shareWithDepartment } = req.body;

        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Security Check: Only owner can share
        if (document.uploader.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to share this document.' });
        }

        const sender = await User.findById(req.user.id);

        if (targetUserId) {
            // Check if already shared
            if (!document.sharedWith.includes(targetUserId)) {
                document.sharedWith.push(targetUserId);

                // Create Notification
                await Notification.create({
                    recipient: targetUserId,
                    sender: req.user.id,
                    document: id,
                    message: `${sender.name} shared a document with you: "${document.originalName}"`
                });
            }
        }

        if (targetGroupId) {
            const group = await Group.findById(targetGroupId);
            if (!group) return res.status(404).json({ message: 'Group not found.' });

            // Share with all group members except uploader
            const notifications = [];
            group.members.forEach(memberId => {
                const mid = memberId.toString();
                if (mid !== req.user.id && !document.sharedWith.includes(mid)) {
                    document.sharedWith.push(mid);
                    notifications.push({
                        recipient: mid,
                        sender: req.user.id,
                        document: id,
                        message: `${sender.name} shared a document with your group "${group.name}": "${document.originalName}"`
                    });
                }
            });

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        if (shareWithDepartment !== undefined) {
            document.departmentShare = shareWithDepartment;
        }

        await document.save();
        res.status(200).json({ message: 'Document shared successfully.', document });
    } catch (error) {
        console.error('Share Document Error:', error);
        res.status(500).json({ message: 'Server error sharing document' });
    }
};

// 10. Get shared documents
const getSharedDocuments = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const { time, type, uploaderId } = req.query;

        // Shared directly with me OR shared with my department
        let query = {
            uploader: { $ne: req.user.id }, // Not my own document
            $or: [
                { sharedWith: req.user.id }
            ]
        };

        if (user.department) {
            // Find other users in the same department
            const deptUsers = await User.find({ department: user.department, _id: { $ne: req.user.id } }).select('_id');
            const deptUserIds = deptUsers.map(u => u._id);

            query.$or.push({
                uploader: { $in: deptUserIds },
                departmentShare: true
            });
        }

        // Apply filters
        if (uploaderId) {
            query.uploader = uploaderId;
        }

        if (time && time !== 'all') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(time));
            query.createdAt = { $gte: cutoff };
        }

        if (type && type !== 'all') {
            if (type === 'pdf') query.mimeType = { $regex: 'pdf', $options: 'i' };
            else if (type === 'image') query.mimeType = { $regex: 'image', $options: 'i' };
            else if (type === 'doc') query.mimeType = { $regex: 'officedocument|msword|word', $options: 'i' };
        }

        const documents = await Document.find(query)
            .populate('uploader', 'name designation department profilePic')
            .sort({ createdAt: -1 });

        res.status(200).json(documents);
    } catch (error) {
        console.error('Get Shared Documents Error:', error);
        res.status(500).json({ message: 'Server error fetching shared documents' });
    }
};

module.exports = { uploadDocuments, getMyDocuments, searchDocuments, deleteDocument, getPublicUserDocuments, toggleDocumentPrivacy, generateSummary, askDocumentQuestion, shareDocument, getSharedDocuments };