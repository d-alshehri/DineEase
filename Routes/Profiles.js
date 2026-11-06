const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const SELECT_PROFILE = `
  SELECT p.id, p.full_name, p.email, p.phone, p.dob, p.restaurant_name, p.plan_id,
         p.created_at, p.updated_at,
         pl.name AS plan_name, pl.price AS plan_price, pl.duration AS plan_duration
  FROM user_profiles p
  LEFT JOIN plans pl ON pl.id = p.plan_id`;

const out = r => ({ ...r, plan_price: r.plan_price === null ? null : Number(r.plan_price) });


function validateProfile(b, isCreate) {
  const errors = [];
  const full_name = String(b.full_name ?? '').trim();
  const email = String(b.email ?? '').trim().toLowerCase();
  const phone = String(b.phone ?? '').trim();
  const dob = b.dob ?? '';
  const password = b.password === undefined || b.password === '' ? null : String(b.password);
  const restaurant_name = b.restaurant_name ? String(b.restaurant_name).trim() : null;
  const plan_id = b.plan_id === undefined || b.plan_id === '' || b.plan_id === null ? null : Number(b.plan_id);

  if (full_name.length < 3 || full_name.length > 50) errors.push('full_name must be 3-50 characters');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) errors.push('a valid email is required');
  if (!/^05[0-9]{8}$/.test(phone)) errors.push('phone must be 10 digits starting with 05');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || isNaN(Date.parse(dob)) || dob < '1950-01-01' || dob > '2008-12-31')
    errors.push('dob must be a valid date between 1950-01-01 and 2008-12-31');
  if (isCreate && password === null) errors.push('password is required');
  if (password !== null && !/^(?=.*[0-9])(?=.*[A-Za-z]).{8,}$/.test(password))
    errors.push('password must be at least 8 characters with letters and numbers');
  if (restaurant_name && restaurant_name.length > 100) errors.push('restaurant_name max 100 characters');
  if (plan_id !== null && (!Number.isInteger(plan_id) || plan_id < 1)) errors.push('plan_id must be a positive integer');

  return { errors, password, data: { full_name, email, phone, dob, restaurant_name, plan_id } };
}

function dbError(err, res) {
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'plan_id does not exist' });
  throw err;
}


router.post('/login', wrap(async (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  const [rows] = await pool.query('SELECT id, password_hash FROM user_profiles WHERE email = ?', [email]);
  const ok = rows.length && await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  const [profile] = await pool.query(`${SELECT_PROFILE} WHERE p.id = ?`, [rows[0].id]);
  res.json(out(profile[0]));
}));


router.get('/', wrap(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_PROFILE} ORDER BY p.id`);
  res.json(rows.map(out));
}));

router.get('/:id', wrap(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_PROFILE} WHERE p.id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Profile not found' });
  res.json(out(rows[0]));
}));


router.post('/', wrap(async (req, res) => {
  const { errors, data, password } = validateProfile(req.body, true);
  if (errors.length) return res.status(400).json({ errors });
  data.password_hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query('INSERT INTO user_profiles SET ?', [data]);
    const [rows] = await pool.query(`${SELECT_PROFILE} WHERE p.id = ?`, [result.insertId]);
    res.status(201).json(out(rows[0]));
  } catch (err) { dbError(err, res); }
}));


router.put('/:id', wrap(async (req, res) => {
  const { errors, data, password } = validateProfile(req.body, false);
  if (errors.length) return res.status(400).json({ errors });
  if (password !== null) data.password_hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query('UPDATE user_profiles SET ? WHERE id = ?', [data, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Profile not found' });
    const [rows] = await pool.query(`${SELECT_PROFILE} WHERE p.id = ?`, [req.params.id]);
    res.json(out(rows[0]));
  } catch (err) { dbError(err, res); }
}));


router.delete('/:id', wrap(async (req, res) => {
  const [result] = await pool.query('DELETE FROM user_profiles WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Profile not found' });
  res.json({ message: 'Profile deleted' });
}));

module.exports = router;
