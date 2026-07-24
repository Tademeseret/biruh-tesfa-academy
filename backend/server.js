// server.js
// Application entrypoint: wires up Express, middleware, static file
// serving for uploads, all route groups, and the global error handler.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { verifyConnection } = require('./db');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load cron reminder jobs
require('./cron/reminderCron');

const app = express();

// --- Core middleware ---
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve uploaded files (receipts, PDFs, images) statically ---
// e.g. GET http://localhost:5000/uploads/resources/171234-worksheet.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Health check ---
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running.' }));

// --- Route groups ---
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  await verifyConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Biruh Tesfa Academy API running on http://localhost:${PORT}`);
  });
})();
