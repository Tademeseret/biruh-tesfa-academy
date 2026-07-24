-- ============================================================
-- Biruh Tesfa Academy - Database Schema
-- Database: MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS biruh_tesfa_academy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE biruh_tesfa_academy;

-- ------------------------------------------------------------
-- ADMINS (Director / staff who log into the dashboard)
-- Passwords must be stored as bcrypt hashes, never plain text.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('director', 'staff') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- STUDENTS (public registration submissions)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- Student Personal Info
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  date_of_birth DATE NOT NULL,
  place_of_birth VARCHAR(150) NOT NULL,
  nationality VARCHAR(100) NOT NULL DEFAULT 'Ethiopian',
  grade_applied ENUM('KG1', 'KG2', 'KG3', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6') NOT NULL,
  grade ENUM('KG1', 'KG2', 'KG3', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6') NOT NULL,
  
  -- Parent/Guardian Info
  parent_full_name VARCHAR(150) NOT NULL,
  parent_name VARCHAR(150) NOT NULL,
  relationship_to_student VARCHAR(50) NOT NULL,
  primary_phone VARCHAR(20) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  secondary_phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  parent_email VARCHAR(150) DEFAULT NULL,
  occupation VARCHAR(100) DEFAULT NULL,
  residential_address VARCHAR(255) NOT NULL,
  address VARCHAR(255) DEFAULT NULL,

  -- Emergency Contact Info
  emergency_contact_name VARCHAR(150) NOT NULL,
  emergency_relation VARCHAR(50) NOT NULL,
  emergency_phone VARCHAR(20) NOT NULL,

  -- Medical & Health Info
  blood_type VARCHAR(10) DEFAULT NULL,
  allergies TEXT DEFAULT NULL,
  chronic_conditions TEXT DEFAULT NULL,
  regular_medications TEXT DEFAULT NULL,

  -- Previous Academic History
  previous_school_name VARCHAR(150) DEFAULT NULL,
  previous_school VARCHAR(150) DEFAULT NULL,
  last_grade_completed VARCHAR(50) DEFAULT NULL,
  reason_for_transfer TEXT DEFAULT NULL,

  -- Account & System Security
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'inactive') NOT NULL DEFAULT 'pending',
  registration_status ENUM('pending', 'approved', 'rejected', 'inactive') NOT NULL DEFAULT 'pending',
  admin_note VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_students_status (registration_status),
  INDEX idx_students_grade (grade)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- PAYMENTS (registration fee / tuition receipts uploaded by parents)
-- One-to-one with the student registration in this simple flow,
-- but modeled as its own table so future terms/re-payments fit in.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  receipt_image_path VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) DEFAULT NULL,
  payment_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_by INT DEFAULT NULL,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_payments_status (payment_status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- RESOURCES (worksheets / textbooks, filtered by grade)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  grade ENUM('KG1', 'KG2', 'KG3', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6') NOT NULL,
  resource_type ENUM('worksheet', 'textbook') NOT NULL DEFAULT 'worksheet',
  file_path VARCHAR(255) NOT NULL,
  uploaded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_resources_grade (grade)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ANNOUNCEMENTS (text notices, optional attached file/image)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  attachment_path VARCHAR(255) DEFAULT NULL,
  posted_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_announcements_created (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- GALLERY (public school photos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caption VARCHAR(200) DEFAULT NULL,
  image_path VARCHAR(255) NOT NULL,
  uploaded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Seed a default director account.
-- Password below is a bcrypt hash for "ChangeMe123!" — CHANGE IT
-- immediately after first login in production.
-- ------------------------------------------------------------
INSERT INTO admins (full_name, email, password_hash, role)
VALUES (
  'School Director',
  'tade@gmail.com',
  '$2b$10$KXXbHQOeBaeYI3NDykv0IeJEPG0hQQlZosVwcpgG/9Wz9ZuhA1oj2',
  'director'
)
ON DUPLICATE KEY UPDATE email = email;

-- ------------------------------------------------------------
-- GRADE FEES (Monthly tuition fees, due days, sibling discounts, and penalties)
-- ------------------------------------------------------------
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
