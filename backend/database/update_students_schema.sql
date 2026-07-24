-- ============================================================
-- Biruh Tesfa Academy - Database Migration Script
-- Updates the `students` table to accommodate full admission fields
-- ============================================================

USE biruh_tesfa_academy;

-- 1. Student Personal Info
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT NULL AFTER id,
  ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100) DEFAULT NULL AFTER first_name,
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT NULL AFTER middle_name,
  ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(150) DEFAULT NULL AFTER date_of_birth,
  ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) DEFAULT 'Ethiopian' AFTER place_of_birth,
  ADD COLUMN IF NOT EXISTS grade_applied ENUM('KG1', 'KG2', 'KG3', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6') DEFAULT NULL AFTER nationality;

-- 2. Parent/Guardian Info
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS parent_full_name VARCHAR(150) DEFAULT NULL AFTER grade_applied,
  ADD COLUMN IF NOT EXISTS relationship_to_student VARCHAR(50) DEFAULT NULL AFTER parent_full_name,
  ADD COLUMN IF NOT EXISTS primary_phone VARCHAR(20) DEFAULT NULL AFTER relationship_to_student,
  ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(20) DEFAULT NULL AFTER primary_phone,
  ADD COLUMN IF NOT EXISTS email VARCHAR(150) DEFAULT NULL AFTER secondary_phone,
  ADD COLUMN IF NOT EXISTS occupation VARCHAR(100) DEFAULT NULL AFTER email,
  ADD COLUMN IF NOT EXISTS residential_address VARCHAR(255) DEFAULT NULL AFTER occupation;

-- 3. Emergency Contact Info
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(150) DEFAULT NULL AFTER residential_address,
  ADD COLUMN IF NOT EXISTS emergency_relation VARCHAR(50) DEFAULT NULL AFTER emergency_contact_name,
  ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20) DEFAULT NULL AFTER emergency_relation;

-- 4. Medical & Health Info
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10) DEFAULT NULL AFTER emergency_phone,
  ADD COLUMN IF NOT EXISTS allergies TEXT DEFAULT NULL AFTER blood_type,
  ADD COLUMN IF NOT EXISTS chronic_conditions TEXT DEFAULT NULL AFTER allergies,
  ADD COLUMN IF NOT EXISTS regular_medications TEXT DEFAULT NULL AFTER chronic_conditions;

-- 5. Previous Academic History
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS previous_school_name VARCHAR(150) DEFAULT NULL AFTER regular_medications,
  ADD COLUMN IF NOT EXISTS last_grade_completed VARCHAR(50) DEFAULT NULL AFTER previous_school_name,
  ADD COLUMN IF NOT EXISTS reason_for_transfer TEXT DEFAULT NULL AFTER last_grade_completed;

-- 6. Account Status Alias / Synonym
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected', 'inactive') DEFAULT 'pending' AFTER registration_status;

-- Populate/sync existing data if present
UPDATE students 
SET 
  first_name = IFNULL(first_name, SUBSTRING_INDEX(full_name, ' ', 1)),
  middle_name = IFNULL(middle_name, IF(LOCATE(' ', full_name) > 0, SUBSTRING_INDEX(SUBSTRING_INDEX(full_name, ' ', 2), ' ', -1), '')),
  last_name = IFNULL(last_name, IF(CHAR_LENGTH(full_name) - CHAR_LENGTH(REPLACE(full_name, ' ', '')) >= 2, SUBSTRING_INDEX(full_name, ' ', -1), '')),
  grade_applied = IFNULL(grade_applied, grade),
  parent_full_name = IFNULL(parent_full_name, parent_name),
  primary_phone = IFNULL(primary_phone, parent_phone),
  email = IFNULL(email, parent_email),
  residential_address = IFNULL(residential_address, address),
  previous_school_name = IFNULL(previous_school_name, previous_school),
  status = IFNULL(status, registration_status)
WHERE id IS NOT NULL;
