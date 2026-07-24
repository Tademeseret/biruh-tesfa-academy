// middleware/errorHandler.js
// Centralized error handler so every route can just `throw` or call
// `next(err)` and get a consistent JSON error response, instead of
// duplicating try/catch response formatting everywhere.

const multer = require('multer');

function notFoundHandler(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  // Multer-specific errors (file too large, wrong type, etc.)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  if (err.message && err.message.startsWith('Invalid file type')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // MySQL duplicate entry, FK violation, etc.
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
}

module.exports = { notFoundHandler, errorHandler };
