// config/multer.js
// Central multer configuration for all file uploads in the app.
// Files are grouped into subfolders by purpose so they stay organized:
//   uploads/receipts        -> payment receipt images
//   uploads/resources       -> worksheet/textbook PDFs
//   uploads/announcements   -> announcement attachments (image or PDF)
//   uploads/gallery         -> public gallery photos

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

// Make sure every destination folder exists before multer tries to write to it.
const FOLDERS = ['receipts', 'resources', 'announcements', 'gallery'];
FOLDERS.forEach((folder) => {
  const dir = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const PDF_TYPE = 'application/pdf';

/**
 * Builds a multer instance scoped to one upload "category".
 * @param {string} folder - one of FOLDERS
 * @param {string[]} allowedMimeTypes - mime types permitted for this category
 */
function buildUploader(folder, allowedMimeTypes) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(UPLOAD_ROOT, folder));
    },
    filename: (req, file, cb) => {
      // Sanitize + timestamp the filename to avoid collisions and path traversal.
      const ext = path.extname(file.originalname).toLowerCase();
      const safeBase = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .slice(0, 50);
      const uniqueName = `${Date.now()}-${safeBase}${ext}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`));
    }
  };

  const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB) || 10;

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
  });
}

module.exports = {
  uploadReceipt: buildUploader('receipts', IMAGE_TYPES),
  uploadResource: buildUploader('resources', [PDF_TYPE]),
  uploadAnnouncementFile: buildUploader('announcements', [...IMAGE_TYPES, PDF_TYPE]),
  uploadGalleryImage: buildUploader('gallery', IMAGE_TYPES),
};
