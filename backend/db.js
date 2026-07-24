// db.js
// Creates and exports a reusable MySQL connection pool using mysql2/promise.
// A pool (instead of a single connection) lets Express handle many
// concurrent requests without manually opening/closing connections.

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Fail fast on startup if the database is unreachable, instead of
// discovering it later on the first API request.
async function verifyConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully.');
    
    // Check if grade_fees table exists and has monthly_amount column. Recreate if mismatch.
    try {
      await connection.query('SELECT monthly_amount FROM grade_fees LIMIT 1');
    } catch (e) {
      console.log('⚠️ grade_fees table missing columns or out-of-date. Rebuilding...');
      await connection.query('DROP TABLE IF EXISTS grade_fees');
    }

    // Auto-migrate grade_fees table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS grade_fees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        grade ENUM('KG1', 'KG2', 'KG3', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6') NOT NULL UNIQUE,
        monthly_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        due_day INT NOT NULL DEFAULT 10,
        sibling_discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        daily_penalty_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;
    await connection.query(createTableQuery);
    
    // Auto-seed default values if not present (handling DUPLICATE KEY to avoid overwrite)
    const seedQuery = `
      INSERT INTO grade_fees (grade, monthly_amount, due_day, sibling_discount_percent, daily_penalty_amount)
      VALUES
        ('KG1', 1200.00, 10, 25.00, 15.00),
        ('KG2', 1200.00, 10, 25.00, 15.00),
        ('KG3', 1200.00, 10, 25.00, 15.00),
        ('Grade1', 1500.00, 10, 25.00, 20.00),
        ('Grade2', 1500.00, 10, 25.00, 20.00),
        ('Grade3', 1500.00, 10, 25.00, 20.00),
        ('Grade4', 1500.00, 10, 25.00, 20.00),
        ('Grade5', 1500.00, 10, 25.00, 20.00),
        ('Grade6', 1500.00, 10, 25.00, 20.00)
      ON DUPLICATE KEY UPDATE grade = grade;
    `;
    await connection.query(seedQuery);
    console.log('✅ MySQL schema check & defaults seeded.');
    
    connection.release();
  } catch (error) {
    console.error('❌ Unable to connect or migrate MySQL:', error.message);
    process.exit(1);
  }
}

module.exports = { pool, verifyConnection };
