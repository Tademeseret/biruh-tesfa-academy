// controllers/adminController.js
// Director/staff-only endpoints for reviewing registrations and payments.

const { pool } = require('../db');

// GET /api/admin/registrations?status=pending
async function getRegistrations(req, res, next) {
  try {
    const { status } = req.query; // 'pending' | 'approved' | 'rejected' | undefined (all)
    const params = [];
    let query = `
      SELECT s.id, s.full_name, s.gender, s.date_of_birth, s.grade,
             s.parent_name, s.parent_phone, s.parent_email, s.address,
             s.registration_status, s.created_at,
             p.id AS payment_id, p.receipt_image_path, p.payment_status
      FROM students s
      LEFT JOIN payments p ON p.student_id = s.id
    `;
    if (status) {
      query += ' WHERE s.registration_status = ?';
      params.push(status);
    }
    query += ' ORDER BY s.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, registrations: rows });
  } catch (err) {
    next(err);
  }
}

// Placeholder function for sending SMS or Email notifications to parents
// when a student application is approved.
// You can integrate real service providers like Twilio, Africa's Talking, or Nodemailer here.
async function triggerParentNotification(studentId, parentDetails) {
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  const mailOptions = {
    from: '"Biruh Tesfa Academy" <no-reply@biruhtesfa.edu>',
    to: parentDetails.parent_email,
    subject: 'Student Registration Approved!',
    text: `Dear ${parentDetails.parent_name},\n\nWe are pleased to inform you that your child ${parentDetails.full_name}'s registration has been approved. You can now log into the Student Portal.\n\nBest regards,\nBiruh Tesfa Academy`
  };
  await transporter.sendMail(mailOptions);
  */

  console.log(`\n============================================================`);
  console.log(`[NOTIFICATION SENDER PLACEHOLDER]`);
  console.log(`Student ID: ${studentId}`);
  console.log(`Student Name: ${parentDetails.full_name}`);
  console.log(`Parent Name: ${parentDetails.parent_name}`);
  console.log(`Parent Phone: ${parentDetails.parent_phone}`);
  console.log(`Parent Email: ${parentDetails.parent_email}`);
  console.log(`Status: APPROVED`);
  console.log(`Message: Parent has been notified about student portal access approval.`);
  console.log(`============================================================\n`);
}

// PATCH /api/admin/registrations/:id  { decision: 'approved' | 'rejected' | 'inactive', note?: string }
async function reviewRegistration(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { decision, note } = req.body;

    if (!['approved', 'rejected', 'inactive'].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be 'approved', 'rejected', or 'inactive'." });
    }

    await connection.beginTransaction();

    const [studentResult] = await connection.query(
      `UPDATE students SET registration_status = ?, admin_note = ? WHERE id = ?`,
      [decision, note || null, id]
    );

    if (studentResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Keep the linked payment's status in sync with the registration decision.
    // However, if the decision is 'inactive' (deactivated/archived), do not alter payment records.
    if (decision !== 'inactive') {
      await connection.query(
        `UPDATE payments SET payment_status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE student_id = ?`,
        [decision, req.admin?.id || null, id]
      );
    }

    await connection.commit();

    // Trigger parent notification if the status changed to approved
    if (decision === 'approved') {
      try {
        const [rows] = await pool.query(
          `SELECT full_name, parent_name, parent_phone, parent_email FROM students WHERE id = ?`,
          [id]
        );
        if (rows.length > 0) {
          triggerParentNotification(id, rows[0]).catch(err => {
            console.error('Failed to trigger parental approval notification:', err);
          });
        }
      } catch (err) {
        console.error('Failed to retrieve student details for notification:', err);
      }
    }

    res.json({ success: true, message: `Registration ${decision}.` });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
}

// PUT /api/admin/students/:id
// Body: { full_name, grade, parent_name, parent_phone, parent_email, address }
async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const { full_name, grade, parent_name, parent_phone, parent_email, address } = req.body;

    if (!full_name || !parent_name || !parent_phone) {
      return res.status(400).json({ success: false, message: 'Full name, parent name, and parent phone are required.' });
    }

    const [result] = await pool.query(
      `UPDATE students 
       SET full_name = ?, grade = ?, parent_name = ?, parent_phone = ?, parent_email = ?, address = ? 
       WHERE id = ?`,
      [
        full_name,
        grade || 'Grade1',
        parent_name,
        parent_phone,
        parent_email || null,
        address || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student registration not found.' });
    }

    res.json({ success: true, message: 'Student details updated successfully.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/grade-fees
async function getGradeFees(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM grade_fees ORDER BY id ASC');
    res.json({ success: true, fees: rows });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/grade-fees/:grade
async function updateGradeFee(req, res, next) {
  try {
    const { grade } = req.params;
    const { monthly_amount, due_day, sibling_discount_percent, daily_penalty_amount } = req.body;

    if (monthly_amount === undefined || due_day === undefined || sibling_discount_percent === undefined || daily_penalty_amount === undefined) {
      return res.status(400).json({ success: false, message: 'Missing monthly_amount, due_day, sibling_discount_percent, or daily_penalty_amount.' });
    }

    const [result] = await pool.query(
      `UPDATE grade_fees 
       SET monthly_amount = ?, due_day = ?, sibling_discount_percent = ?, daily_penalty_amount = ? 
       WHERE grade = ?`,
      [
        Number(monthly_amount),
        Number(due_day),
        Number(sibling_discount_percent),
        Number(daily_penalty_amount),
        grade
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `Grade fee configuration for ${grade} not found.` });
    }

    res.json({ success: true, message: `Grade fee configuration for ${grade} updated successfully.` });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getRegistrations, 
  reviewRegistration, 
  updateStudent,
  getGradeFees,
  updateGradeFee
};
