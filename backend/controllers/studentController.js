// controllers/studentController.js
// Handles public student registration, which is submitted as multipart
// FormData containing registration fields + one payment receipt image.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const VALID_GRADES = ['KG1', 'KG2', 'KG3', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6'];

// POST /api/students/register  (multipart/form-data, field name: "receipt")
async function registerStudent(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const body = req.body || {};

    // Support both camelCase and snake_case inputs for robustness
    const firstName = (body.first_name || body.firstName || '').trim();
    const middleName = (body.middle_name || body.middleName || '').trim();
    const lastName = (body.last_name || body.lastName || '').trim();
    
    // Fallback if client passes legacy single fullName
    let calculatedFullName = '';
    if (firstName || middleName || lastName) {
      calculatedFullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    } else {
      calculatedFullName = (body.full_name || body.fullName || '').trim();
    }

    const gender = body.gender;
    const dateOfBirth = body.date_of_birth || body.dateOfBirth;
    const placeOfBirth = (body.place_of_birth || body.placeOfBirth || '').trim();
    const nationality = (body.nationality || 'Ethiopian').trim();
    const gradeApplied = body.grade_applied || body.gradeApplied || body.grade;

    const parentFullName = (body.parent_full_name || body.parentFullName || body.parent_name || body.parentName || '').trim();
    const relationshipToStudent = (body.relationship_to_student || body.relationshipToStudent || body.relationship || '').trim();
    const primaryPhone = (body.primary_phone || body.primaryPhone || body.parent_phone || body.parentPhone || '').trim();
    const secondaryPhone = (body.secondary_phone || body.secondaryPhone || '').trim() || null;
    const email = (body.email || body.parent_email || body.parentEmail || '').trim() || null;
    const occupation = (body.occupation || '').trim() || null;
    const residentialAddress = (body.residential_address || body.residentialAddress || body.address || '').trim();

    const emergencyContactName = (body.emergency_contact_name || body.emergencyContactName || '').trim();
    const emergencyRelation = (body.emergency_relation || body.emergencyRelation || '').trim();
    const emergencyPhone = (body.emergency_phone || body.emergencyPhone || '').trim();

    const bloodType = (body.blood_type || body.bloodType || '').trim() || null;
    const allergies = (body.allergies || '').trim() || null;
    const chronicConditions = (body.chronic_conditions || body.chronicConditions || '').trim() || null;
    const regularMedications = (body.regular_medications || body.regularMedications || '').trim() || null;

    const previousSchoolName = (body.previous_school_name || body.previousSchoolName || body.previous_school || body.previousSchool || '').trim() || null;
    const lastGradeCompleted = (body.last_grade_completed || body.lastGradeCompleted || '').trim() || null;
    const reasonForTransfer = (body.reason_for_transfer || body.reasonForTransfer || '').trim() || null;

    const username = (body.username || '').trim();
    const password = body.password || '';

    // --- Validation ---
    if (
      !firstName || !middleName || !lastName ||
      !gender || !dateOfBirth || !placeOfBirth || !gradeApplied ||
      !parentFullName || !relationshipToStudent || !primaryPhone || !residentialAddress ||
      !emergencyContactName || !emergencyRelation || !emergencyPhone ||
      !username || !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required registration fields. Please fill out all required sections.',
      });
    }

    if (!VALID_GRADES.includes(gradeApplied)) {
      return res.status(400).json({ success: false, message: 'Invalid grade selection.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'A payment receipt file is required.' });
    }

    await connection.beginTransaction();

    // Check username uniqueness
    const [existingStudent] = await connection.query(
      'SELECT id FROM students WHERE username = ? LIMIT 1',
      [username]
    );
    if (existingStudent.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Username is already taken.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [studentResult] = await connection.query(
      `INSERT INTO students (
        first_name, middle_name, last_name, full_name,
        gender, date_of_birth, place_of_birth, nationality, grade_applied, grade,
        parent_full_name, parent_name, relationship_to_student, primary_phone, parent_phone,
        secondary_phone, email, parent_email, occupation, residential_address, address,
        emergency_contact_name, emergency_relation, emergency_phone,
        blood_type, allergies, chronic_conditions, regular_medications,
        previous_school_name, previous_school, last_grade_completed, reason_for_transfer,
        username, password_hash, status, registration_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        firstName, middleName, lastName, calculatedFullName,
        gender, dateOfBirth, placeOfBirth, nationality, gradeApplied, gradeApplied,
        parentFullName, parentFullName, relationshipToStudent, primaryPhone, primaryPhone,
        secondaryPhone, email, email, occupation, residentialAddress, residentialAddress,
        emergencyContactName, emergencyRelation, emergencyPhone,
        bloodType, allergies, chronicConditions, regularMedications,
        previousSchoolName, previousSchoolName, lastGradeCompleted, reasonForTransfer,
        username, passwordHash
      ]
    );

    const studentId = studentResult.insertId;
    const receiptPath = `/uploads/receipts/${req.file.filename}`;

    // Calculate billing at the moment of registration
    const billing = await calculateBillingForStudent(studentId, primaryPhone, gradeApplied, connection);

    await connection.query(
      `INSERT INTO payments (student_id, receipt_image_path, amount) VALUES (?, ?, ?)`,
      [studentId, receiptPath, billing.discountedFee]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Awaiting administrative review.',
      studentId,
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
}

// GET /api/students/:id/status  (parent can check their application status)
async function getStudentStatus(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.full_name, s.grade, s.registration_status, p.payment_status
       FROM students s
       LEFT JOIN payments p ON p.student_id = s.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, student: rows[0] });
  } catch (err) {
    next(err);
  }
}

// POST /api/students/login
async function loginStudent(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM students WHERE username = ? LIMIT 1', [username]);
    const student = rows[0];

    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    if (student.registration_status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    if (student.registration_status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your registration has been rejected. Please contact the administrator.'
      });
    }

    if (student.registration_status !== 'approved' && student.registration_status !== 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your registration is not active. Please contact the administrator.'
      });
    }

    const token = jwt.sign(
      { studentId: student.id, grade: student.grade },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      token,
      student: {
        id: student.id,
        fullName: student.full_name,
        grade: student.grade,
        username: student.username,
        registrationStatus: student.registration_status,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Function to dynamically calculate base tuition, sibling discount, penalty, and total due
async function calculateBillingForStudent(studentId, parentPhone, grade, dbConnectionOrPool) {
  // 1. Fetch the fee configuration for this grade
  const [feeRows] = await dbConnectionOrPool.query(
    'SELECT * FROM grade_fees WHERE grade = ? LIMIT 1',
    [grade]
  );
  
  if (feeRows.length === 0) {
    throw new Error(`Grade fee configuration for grade "${grade}" not found.`);
  }
  const config = feeRows[0];
  
  // 2. Fetch all children under the same phone number, sorted by ID
  const [siblingRows] = await dbConnectionOrPool.query(
    'SELECT id, created_at FROM students WHERE parent_phone = ? AND registration_status != "rejected" ORDER BY id ASC',
    [parentPhone]
  );
  
  let siblingIndex = -1;
  if (studentId) {
    siblingIndex = siblingRows.findIndex(s => s.id === Number(studentId));
  }
  
  if (siblingIndex === -1) {
    siblingIndex = siblingRows.length;
  }
  
  const baseFee = Number(config.monthly_amount);
  const siblingDiscountPercent = Number(config.sibling_discount_percent);
  const dailyPenaltyAmount = Number(config.daily_penalty_amount);
  const dueDay = Number(config.due_day);
  
  const isSiblingDiscountApplicable = siblingIndex >= 2;
  const siblingDiscountApplied = isSiblingDiscountApplicable
    ? baseFee * (siblingDiscountPercent / 100)
    : 0.00;
  
  const discountedFee = baseFee - siblingDiscountApplied;
  
  let penalty = 0;
  const today = new Date();
  const currentDay = today.getDate();
  let overdueDays = 0;
  if (currentDay > dueDay) {
    overdueDays = currentDay - dueDay;
    penalty = overdueDays * dailyPenaltyAmount;
  }
  
  const totalDue = discountedFee + penalty;
  
  return {
    grade,
    parentPhone,
    siblingIndex,
    isSiblingDiscountApplicable,
    siblingDiscountPercent,
    baseFee,
    siblingDiscountApplied,
    discountedFee,
    dueDay,
    overdueDays,
    dailyPenaltyAmount,
    penalty,
    totalDue
  };
}

// GET /api/students/:id/billing
async function getStudentBillingInfo(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, parent_phone, grade, registration_status FROM students WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const student = rows[0];
    const billing = await calculateBillingForStudent(student.id, student.parent_phone, student.grade, pool);
    
    // Fetch the current month's payment status, if any
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01 00:00:00`;
    const [paymentRows] = await pool.query(
      'SELECT payment_status, receipt_image_path, amount FROM payments WHERE student_id = ? AND created_at >= ? LIMIT 1',
      [id, startOfMonth]
    );
    const payment = paymentRows.length > 0 ? paymentRows[0] : null;

    res.json({
      success: true,
      billing,
      paymentStatus: payment ? payment.payment_status : 'unpaid',
      payment
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  registerStudent, 
  getStudentStatus, 
  loginStudent, 
  getStudentBillingInfo, 
  calculateBillingForStudent 
};
