// routes/adminRoutes.js
// Every route in this file is protected by requireAdmin (JWT auth).
// Mounted at /api/admin in server.js.

const express = require('express');
const router = express.Router();

const { requireAdmin } = require('../middleware/auth');
const { uploadResource, uploadAnnouncementFile, uploadGalleryImage } = require('../config/multer');

const { getRegistrations, reviewRegistration, updateStudent, getGradeFees, updateGradeFee } = require('../controllers/adminController');
const { uploadResource: uploadResourceCtrl, deleteResource } = require('../controllers/resourceController');
const { createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { uploadGalleryImage: uploadGalleryCtrl, updateGalleryImage: updateGalleryCtrl, deleteGalleryImage } = require('../controllers/galleryController');

router.use(requireAdmin); // everything below requires a valid director/staff token

// --- Grade Fees Configuration ---
router.get('/grade-fees', getGradeFees);
router.put('/grade-fees/:grade', updateGradeFee);

// --- Registrations ---
router.get('/registrations', getRegistrations);
router.patch('/registrations/:id', reviewRegistration);
router.put('/students/:id', updateStudent);

// --- Learning resources (PDF worksheets/textbooks) ---
router.post('/resources', uploadResource.single('file'), uploadResourceCtrl);
router.delete('/resources/:id', deleteResource);

// --- Announcements ---
router.post('/announcements', uploadAnnouncementFile.single('attachment'), createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// --- Gallery ---
router.post('/gallery', uploadGalleryImage.single('image'), uploadGalleryCtrl);
router.put('/gallery/:id', uploadGalleryImage.single('image'), updateGalleryCtrl);
router.delete('/gallery/:id', deleteGalleryImage);

module.exports = router;
