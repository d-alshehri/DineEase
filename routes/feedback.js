'use strict';
const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/feedback?keyword=food (also accepts ?search=food)
router.get('/', async (req, res, next) => {
  try {
    const keyword = String(req.query.keyword ?? req.query.search ?? '').trim();
    if (keyword.length > 200) return res.status(400).json({ error: 'Keyword is too long' });
    const search = `%${keyword.replace(/[\\%_]/g, '\\$&')}%`;
    const [rows] = keyword
      ? await db.query("SELECT id, name, email, subject, message, created_at FROM Feedback WHERE name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ? ORDER BY created_at DESC", [search, search, search, search])
      : await db.query('SELECT id, name, email, subject, message, created_at FROM Feedback ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/feedback/:id
router.get('/:id', async (req, res, next) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid feedback ID' });
    const [rows] = await db.query('SELECT id, name, email, subject, message, created_at FROM Feedback WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Feedback not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/feedback
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (![name, email, subject, message].every(v => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required' });
    }
    const data = { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() };
    if (data.name.length > 100 || data.email.length > 255 || data.subject.length > 200 || data.message.length > 5000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({ error: 'Invalid or too-long feedback fields' });
    }
    const [result] = await db.query('INSERT INTO Feedback (name, email, subject, message) VALUES (?, ?, ?, ?)', Object.values(data));
    res.status(201).json({ id: result.insertId, ...data, message_status: 'Feedback created' });
  } catch (err) { next(err); }
});

// DELETE /api/feedback/:id (coursework demo only: protect with authentication before deployment)
router.delete('/:id', async (req, res, next) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid feedback ID' });
    const [result] = await db.query('DELETE FROM Feedback WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ message: 'Feedback deleted', id: Number(req.params.id) });
  } catch (err) { next(err); }
});

module.exports = router;
