const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Replaces spaces with underscores so the URL doesn't break
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

// Notice: We completely removed the fileFilter!
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        cb(null, true); // Accept all files
    },
    limits: { fileSize: 50 * 1024 * 1024 } // I also bumped the limit up to 50MB for heavier files
});

module.exports = upload;
