// routes/studentRoutes.js
// Public-facing registration routes.
const express = require('express');
const router = express.Router();
const { registerStudent, getStudentStatus, loginStudent, getStudentBillingInfo } = require('../controllers/studentController');
const { uploadReceipt } = require('../config/multer');

// multipart/form-data with a single file under the field name "receipt"
router.post('/register', uploadReceipt.single('receipt'), registerStudent);
router.get('/:id/status', getStudentStatus);
router.get('/:id/billing', getStudentBillingInfo);
router.post('/login', loginStudent);

module.exports = router;
