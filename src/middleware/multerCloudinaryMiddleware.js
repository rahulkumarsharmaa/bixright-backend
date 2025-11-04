const multer = require('multer');

// Temporary storage in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
