import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|doc|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF and DOCX documents are accepted.'));
    }
  }
});
