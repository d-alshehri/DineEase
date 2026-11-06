const express = require('express');
const pool = require('../db');
const router = express.Router();

const CATEGORIES = ['Starter', 'Growth', 'Premium'];
const DURATIONS = ['Monthly', 'Yearly'];
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


const out = r => ({ ...r, price: Number(r.price), reservations: !!r.reservations });

function validatePlan(b) {
  const errors = [];
  const name = String(b.name ?? '').trim();
  const description = String(b.description ?? '').trim();
  const price = b.price === undefined || b.price === '' ? NaN : Number(b.price);
  const menu_limit = b.menu_limit === undefined || b.menu_limit === '' ? NaN : Number(b.menu_limit);
  const { category, duration, start_date } = b;

  if (name.length < 3 || name.length > 50) errors.push('name must be 3-50 characters');
  if (!Number.isFinite(price) || price < 0 || price > 100000) errors.push('price must be a number between 0 and 100000');
  if (!CATEGORIES.includes(category)) errors.push('category must be Starter, Growth or Premium');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date ?? '') || isNaN(Date.parse(start_date))) errors.push('start_date must be a valid date (YYYY-MM-DD)');
  if (!DURATIONS.includes(duration)) errors.push('duration must be Monthly or Yearly');
  if (!Number.isInteger(menu_limit) || menu_limit < 1 || menu_limit > 100000) errors.push('menu_limit must be an integer between 1 and 100000');
  if (description.length < 10 || description.length > 300) errors.push('description must be 10-300 characters');

  const reservations = b.reservations === true || b.reservations === 1 || b.reservations === '1' || b.reservations === 'on' || b.reservations === 'true' ? 1 : 0;
  return { errors, data: { name, price, category, start_date, duration, menu_limit, description, reservations } };
}

function dupError(err, res) {
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A plan with this name already exists' });
  throw err;
}


router.get('/', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM plans ORDER BY price ASC, id ASC');
  res.json(rows.map(out));
}));


router.get('/:id', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Plan not found' });
  res.json(out(rows[0]));
}));


router.post('/', wrap(async (req, res) => {
  const { errors, data } = validatePlan(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const [result] = await pool.query('INSERT INTO plans SET ?', [data]);
    const [rows] = await pool.query('SELECT * FROM plans WHERE id = ?', [result.insertId]);
    res.status(201).json(out(rows[0]));
  } catch (err) { dupError(err, res); }
}));


router.put('/:id', wrap(async (req, res) => {
  const { errors, data } = validatePlan(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const [result] = await pool.query('UPDATE plans SET ? WHERE id = ?', [data, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Plan not found' });
    const [rows] = await pool.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
    res.json(out(rows[0]));
  } catch (err) { dupError(err, res); }
}));


router.delete('/:id', wrap(async (req, res) => {
  const [result] = await pool.query('DELETE FROM plans WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Plan not found' });
  res.json({ message: 'Plan deleted' });
}));

module.exports = router;
