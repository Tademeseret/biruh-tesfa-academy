// controllers/announcementController.js
const { pool } = require('../db');

// GET /api/announcements  (public, most recent first)
async function getAnnouncements(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, body, attachment_path, created_at
       FROM announcements ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ success: true, announcements: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/announcements  (multipart/form-data, field name: "attachment", optional)
async function createAnnouncement(req, res, next) {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required.' });
    }

    const attachmentPath = req.file ? `/uploads/announcements/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO announcements (title, body, attachment_path, posted_by) VALUES (?, ?, ?, ?)`,
      [title, body, attachmentPath, req.admin?.id || null]
    );

    res.status(201).json({ success: true, message: 'Announcement published.', announcementId: result.insertId });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/announcements/:id
async function deleteAnnouncement(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
