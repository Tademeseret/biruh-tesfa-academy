// controllers/galleryController.js
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');

// GET /api/gallery  (public / admin)
async function getGalleryImages(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, caption, image_path, created_at FROM gallery ORDER BY created_at DESC`
    );
    res.json({ success: true, images: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/gallery  (multipart/form-data, field name: "image")
async function uploadGalleryImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'An image file is required.' });
    }
    const { caption } = req.body;
    const imagePath = `/uploads/gallery/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO gallery (caption, image_path, uploaded_by) VALUES (?, ?, ?)`,
      [caption || null, imagePath, req.admin?.id || null]
    );

    res.status(201).json({ success: true, message: 'Image added to gallery.', imageId: result.insertId });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/gallery/:id (multipart/form-data, optional field: "image")
async function updateGalleryImage(req, res, next) {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const [existing] = await pool.query('SELECT * FROM gallery WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Gallery image not found.' });
    }

    let newImagePath = existing[0].image_path;

    if (req.file) {
      newImagePath = `/uploads/gallery/${req.file.filename}`;

      // Delete old file from disk if it exists
      if (existing[0].image_path) {
        const oldPath = path.join(__dirname, '..', existing[0].image_path);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (unlinkErr) {
            console.warn('Warning: Failed to delete old image file:', unlinkErr.message);
          }
        }
      }
    }

    await pool.query(
      `UPDATE gallery SET caption = ?, image_path = ? WHERE id = ?`,
      [caption !== undefined ? caption : existing[0].caption, newImagePath, id]
    );

    res.json({ success: true, message: 'Gallery item updated successfully.' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/gallery/:id
async function deleteGalleryImage(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT image_path FROM gallery WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    const imagePath = existing[0].image_path;
    if (imagePath) {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (unlinkErr) {
          console.warn('Warning: Failed to delete file on disk:', unlinkErr.message);
        }
      }
    }

    await pool.query('DELETE FROM gallery WHERE id = ?', [id]);
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGalleryImages, uploadGalleryImage, updateGalleryImage, deleteGalleryImage };
