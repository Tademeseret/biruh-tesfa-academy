// routes/resourceRoutes.js
// Public read access for the student/parent portal.
const express = require('express');
const router = express.Router();
const { getResourcesByGrade } = require('../controllers/resourceController');

router.get('/', getResourcesByGrade); // /api/resources?grade=Grade2

module.exports = router;
