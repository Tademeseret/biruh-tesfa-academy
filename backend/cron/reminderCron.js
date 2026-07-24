// cron/reminderCron.js
// Daily cron job using node-cron. Runs every night to audit payments relative to due dates.
const cron = require('node-cron');
const { pool } = require('../db');
const { calculateBillingForStudent } = require('../controllers/studentController');

// Helper to simulate SMS delivery
function sendMockSMS({ parentPhone, parentName, studentName, baseFee, siblingDiscountApplied, penalty, totalDue }) {
  const discountText = siblingDiscountApplied > 0 
    ? ` (Sibling discount applied: -${siblingDiscountApplied.toFixed(2)} Birr)` 
    : '';
  
  const smsBody = `Dear ${parentName}, Biruh Tesfa Academy tuition payment for ${studentName} is overdue. Standard tuition rate: ${baseFee.toFixed(2)} Birr${discountText}. Accumulated daily penalty fee: ${penalty.toFixed(2)} Birr. Final total amount due: ${totalDue.toFixed(2)} Birr. Please upload your payment receipt immediately via the student portal.`;

  console.log(`\n============================================================`);
  console.log(`[MOCK SMS REMINDER SENDER]`);
  console.log(`Recipient Name: ${parentName}`);
  console.log(`Phone Primary: ${parentPhone}`);
  console.log(`Message Body:\n"${smsBody}"`);
  console.log(`============================================================\n`);
}

// Scheduled task running daily at midnight (0 0 * * *)
// You can adjust schedule expression, e.g., '*/10 * * * * *' for 10-second audits during testing
const reminderJob = cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily tuition fee cron audit at', new Date().toISOString());
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Fetch all approved/active students
    const [students] = await connection.query(
      `SELECT id, full_name, grade, parent_name, parent_phone, parent_email, created_at 
       FROM students 
       WHERE registration_status = 'approved'`
    );

    const now = new Date();
    const currentDay = now.getDate();
    // Get start of actual calendar month e.g. "2026-07-01 00:00:00"
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01 00:00:00`;

    for (const student of students) {
      // 2. Resolve billing and date configuration for this specific student/grade
      const billing = await calculateBillingForStudent(
        student.id,
        student.parent_phone,
        student.grade,
        connection
      );

      // 3. Compare current date with grade's due_day
      if (currentDay > billing.dueDay) {
        // 4. Deadline has passed. Audit if parent has uploaded a verified receipt for this current month
        const [paymentRows] = await connection.query(
          `SELECT id FROM payments 
           WHERE student_id = ? 
             AND payment_status = 'approved' 
             AND created_at >= ? 
           LIMIT 1`,
          [student.id, startOfMonth]
        );

        const hasPaidCurrentMonth = paymentRows.length > 0;
        if (!hasPaidCurrentMonth) {
          // Trigger the mock SMS reminder
          sendMockSMS({
            parentPhone: student.parent_phone,
            parentName: student.parent_name,
            studentName: student.full_name,
            baseFee: billing.baseFee,
            siblingDiscountApplied: billing.siblingDiscountApplied,
            penalty: billing.penalty,
            totalDue: billing.totalDue
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Error executing automated tuition reminders cron:', error);
  } finally {
    if (connection) connection.release();
  }
});

console.log('⏰ Automated SMS Tuition Reminder Cron Job Registered and Scheduled.');

// Exporting to enable developer control / force trigger in manual tests
module.exports = {
  reminderJob,
  sendMockSMS
};
