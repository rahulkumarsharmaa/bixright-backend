const multer = require("multer");
const path = require("path");

const fs = require("fs");

const upload = (folderName) => {
    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = `./uploads/${folderName}`;
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uploadPath = `./uploads/${folderName}`;
                fs.readdir(uploadPath, (err, files) => {
                    let count = 1;
                    if (!err && files) {
                        // Filter files that start with the folderName to count correctly
                        // This handles cases where other files might exist
                        const validFiles = files.filter(f => f.startsWith(folderName + '-'));

                        // More robust counting: parse existing numbers
                        // Find the highest existing number to avoid collisions if files were deleted
                        let maxNum = 0;
                        validFiles.forEach(f => {
                            const match = f.match(new RegExp(`^${folderName}-(\\d+)`));
                            if (match) {
                                const num = parseInt(match[1], 10);
                                if (num > maxNum) maxNum = num;
                            }
                        });
                        count = maxNum + 1;
                    }

                    const ext = path.extname(file.originalname);
                    const newFilename = `${folderName}-${count}${ext}`;

                    // Simple check if file exists (unlikely with maxNum logic, but good practice)
                    // If we wanted to be strictly sequential filling gaps, we'd need a loop, 
                    // but maxNum + 1 is safer/faster for avoiding overwrites.

                    cb(null, newFilename);
                });
            },
        }),
    });
};

module.exports = upload;
