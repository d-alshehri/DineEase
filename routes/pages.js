// Page routes: they read data from MySQL and render the EJS views.
// The JSON API routes are in plans.js, profiles.js and feedback.js.

const express = require('express');
const db = require('../db');

const router = express.Router();

// "2026-01-01" or "2026-11-15 19:26:17" -> "1 Jan 2026"
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split('-');
  if (!year || !month || !day) return String(value);
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

// Empty values for the Add Plan form (Edit fills the same form with a real plan)
const EMPTY_PLAN = {
  id: null, name: '', price: '', category: '', start_date: '',
  duration: '', menu_limit: '', description: '', reservations: 0
};

// Home
router.get('/', async (req, res) => {
  let plans = [];
  try {
    const [rows] = await db.query(
      'SELECT id, name, price, category, duration, menu_limit, reservations, description FROM plans ORDER BY price'
    );
    plans = rows;
  } catch (error) {
    // if the DB is down the home page still loads, just without plans
    console.error('Could not load plans for the home page:', error.message);
  }
  res.render('index', { title: 'Home', active: 'home', plans: plans });
});

// Plans
// Customers: /plans and /plans/5. Management: /plans/manage, /plans/add, /plans/5/edit

async function getAllPlans() {
  const [rows] = await db.query('SELECT * FROM plans ORDER BY price ASC, id ASC');
  return rows.map((plan) => ({ ...plan, start_date_label: formatDate(plan.start_date) }));
}

router.get('/plans', async (req, res, next) => {
  try {
    res.render('plans/plan-details', {
      title: 'Plans',
      active: 'plans',
      styles: ['/css/plans.css'],
      plans: await getAllPlans(),
      manage: false   // no Edit / Delete buttons
    });
  } catch (error) {
    next(error);
  }
});

// Has to be before /plans/:id, or "manage" would be read as an id
router.get('/plans/manage', async (req, res, next) => {
  try {
    res.render('plans/plan-details', {
      title: 'Manage Plans',
      active: 'manage-plans',
      styles: ['/css/plans.css'],
      plans: await getAllPlans(),
      manage: true
    });
  } catch (error) {
    next(error);
  }
});

router.get('/plans/add', (req, res) => {
  res.render('plans/add-plan', {
    title: 'Add Plan',
    active: 'manage-plans',
    styles: ['/css/plans.css'],
    mode: 'create',
    plan: EMPTY_PLAN
  });
});

router.get('/plans/:id/edit', async (req, res, next) => {
  try {
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(404).render('404', { title: '404' });
    }

    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).render('404', { title: '404' });
    }

    res.render('plans/add-plan', {
      title: 'Edit Plan',
      active: 'manage-plans',
      styles: ['/css/plans.css'],
      mode: 'edit',
      plan: rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// One plan's page ("View Plan" on the home page)
router.get('/plans/:id', async (req, res, next) => {
  try {
    // not a number (e.g. /plans/plan-details.html): skip, so the redirects below can handle it
    if (!/^\d+$/.test(req.params.id)) {
      return next();
    }

    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).render('404', { title: '404' });
    }

    const plan = { ...rows[0], start_date_label: formatDate(rows[0].start_date) };
    res.render('plans/plan', {
      title: plan.name,
      active: 'plans',
      styles: ['/css/plans.css'],
      plan: plan
    });
  } catch (error) {
    next(error);
  }
});

// Support: /support, /support?keyword=x (search), /support?sent=1 (after sending feedback)
router.get('/support', async (req, res, next) => {
  try {
    const keyword = String(req.query.keyword || '').trim().slice(0, 200);

    // Same search as GET /api/feedback?keyword= in feedback.js.
    // % and _ are wildcards in LIKE, so we escape them to search for them as normal characters.
    const search = `%${keyword.replace(/[\\%_]/g, '\\$&')}%`;
    const columns = 'id, name, email, subject, message, created_at';

    const [rows] = keyword
      ? await db.query(
          `SELECT ${columns} FROM Feedback
           WHERE name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?
           ORDER BY created_at DESC, id DESC`,
          [search, search, search, search]
        )
      : await db.query(`SELECT ${columns} FROM Feedback ORDER BY created_at DESC, id DESC`);

    const feedback = rows.map((item) => ({ ...item, date_label: formatDate(item.created_at) }));

    res.render('support', {
      title: 'Feedback & Support',
      active: 'support',
      styles: ['/css/support.css'],
      feedback: feedback,
      keyword: keyword,
      sent: req.query.sent === '1'
    });
  } catch (error) {
    next(error);
  }
});

// Profile pages
router.get('/login', (req, res) => {
  res.render('profile/login', { title: 'Log In', active: 'profile' });
});

router.get('/signup', (req, res) => {
  res.render('profile/add-user', { title: 'Sign Up', active: 'profile' });
});

// /profile?id=5
router.get('/profile', async (req, res, next) => {
  try {
    const id = String(req.query.id || '');

    if (!/^\d+$/.test(id)) {
      return res.redirect('/login');
    }

    // LEFT JOIN so users without a plan still show up
    const [rows] = await db.query(
      `SELECT p.full_name, p.email, p.phone, p.restaurant_name, p.plan_id,
              pl.name AS plan_name, pl.price AS plan_price, pl.duration AS plan_duration
       FROM user_profiles p
       LEFT JOIN plans pl ON pl.id = p.plan_id
       WHERE p.id = ?`,
      [id] // ? placeholder, so the id can't be used for SQL injection
    );

    if (rows.length === 0) {
      return res.status(404).render('404', { title: '404' });
    }

    res.render('profile/profile', {
      title: 'Profile',
      active: 'profile',
      user: rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Old Phase 1 URLs redirect (301) to the new routes, so old links still work
const oldUrls = {
  '/index.html': '/',
  '/support.html': '/support',
  '/plans/plan-details.html': '/plans',
  '/plans/add-plan.html': '/plans/add',
  '/user-profile/login.html': '/login',
  '/user-profile/add-user.html': '/signup',
  '/user-profile/Profile.html': '/profile'
};

Object.keys(oldUrls).forEach((oldUrl) => {
  router.get(oldUrl, (req, res) => {
    // keep the query string, so Profile.html?id=5 -> /profile?id=5
    const queryIndex = req.originalUrl.indexOf('?');
    const query = queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex);
    res.redirect(301, oldUrls[oldUrl] + query);
  });
});

module.exports = router;
