// routes/announcementRoutes.js
// Public read access for the home page announcement board.
const express = require('express');
const router = express.Router();
const { getAnnouncements } = require('../controllers/announcementController');

router.get('/', getAnnouncements);

module.exports = router;
