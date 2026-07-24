// controllers/resourceController.js
// Public: fetch worksheets/textbooks filtered by grade.
// Admin: upload new PDF learning materials.

const { pool } = require('../db');

const VALID_GRADES = ['KG1', 'KG2', 'KG3', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6'];

// GET /api/resources?grade=Grade3
async function getResourcesByGrade(req, res, next) {
  try {
    const { grade } = req.query;
    if (!grade || !VALID_GRADES.includes(grade)) {
      return res.status(400).json({ success: false, message: 'A valid grade query parameter is required.' });
    }

    const [rows] = await pool.query(
      `SELECT id, title, description, grade, resource_type, file_path, created_at
       FROM resources WHERE grade = ? ORDER BY created_at DESC`,
      [grade]
    );

    res.json({ success: true, resources: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/resources  (multipart/form-data, field name: "file")
async function uploadResource(req, res, next) {
  try {
    const { title, description, grade, resourceType } = req.body;

    if (!title || !grade || !resourceType) {
      return res.status(400).json({ success: false, message: 'Title, grade, and resource type are required.' });
    }
    if (!VALID_GRADES.includes(grade)) {
      return res.status(400).json({ success: false, message: 'Invalid grade.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'A PDF file is required.' });
    }

    const filePath = `/uploads/resources/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO resources (title, description, grade, resource_type, file_path, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || null, grade, resourceType, filePath, req.admin?.id || null]
    );

    res.status(201).json({ success: true, message: 'Resource uploaded successfully.', resourceId: result.insertId });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/resources/:id
async function deleteResource(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM resources WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    res.json({ success: true, message: 'Resource deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getResourcesByGrade, uploadResource, deleteResource };
