// ===================================================================
// Page routes: every route here sends back a WEB PAGE (HTML) with res.render().
// The data is read from MySQL here, in the route, and passed to the EJS view.
// The JSON "web API" routes are in plans.js, profiles.js and feedback.js.
// ===================================================================

const express = require('express');
const db = require('../db'); // shared MySQL connection pool

const router = express.Router();

// ---------- Helpers ----------

// Turns a MySQL date like "2026-01-01" or "2026-11-15 19:26:17" into "1 Jan 2026".
// (db.js uses dateStrings: true, so MySQL dates arrive as plain text.)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split('-');
  if (!year || !month || !day) return String(value); // unexpected format: show it as it is
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

// The empty form for "Add Plan". The Edit page fills the same form with a real plan instead.
const EMPTY_PLAN = {
  id: null, name: '', price: '', category: '', start_date: '',
  duration: '', menu_limit: '', description: '', reservations: 0
};

// ---------- Home page ----------
// GET / -> views/index.ejs, with the pricing plans read from the database
router.get('/', async (req, res) => {
  let plans = [];
  try {
    const [rows] = await db.query(
      'SELECT id, name, price, category, duration, menu_limit, reservations, description FROM plans ORDER BY price'
    );
    plans = rows;
  } catch (error) {
    // The home page still loads without the database. It just shows "no plans".
    console.error('Could not load plans for the home page:', error.message);
  }
  res.render('index', { title: 'Home', active: 'home', plans: plans });
});

// ---------- Plans pages ----------

// GET /plans -> views/plans/plan-details.ejs with all plans from the database
router.get('/plans', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM plans ORDER BY price ASC, id ASC');

    // Add a nicely formatted date to every plan, e.g. "1 Jan 2026"
    const plans = rows.map((plan) => ({ ...plan, start_date_label: formatDate(plan.start_date) }));

    res.render('plans/plan-details', {
      title: 'Plans',
      active: 'plans',
      styles: ['/css/plans.css'],
      plans: plans
    });
  } catch (error) {
    next(error); // pass the error to the error-handling middleware in server.js
  }
});

// GET /plans/add -> the plan form, empty ("create" mode)
router.get('/plans/add', (req, res) => {
  res.render('plans/add-plan', {
    title: 'Add Plan',
    active: 'add-plan',
    styles: ['/css/plans.css'],
    mode: 'create',
    plan: EMPTY_PLAN
  });
});

// GET /plans/5/edit -> the SAME plan form, filled with plan 5 ("edit" mode)
router.get('/plans/:id/edit', async (req, res, next) => {
  try {
    // The id must contain only digits, otherwise the page does not exist
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(404).render('404', { title: '404' });
    }

    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).render('404', { title: '404' });
    }

    res.render('plans/add-plan', {
      title: 'Edit Plan',
      active: 'plans',
      styles: ['/css/plans.css'],
      mode: 'edit',
      plan: rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// ---------- Feedback & Support page ----------

// GET /support            -> all feedback, newest first
// GET /support?keyword=x  -> only the feedback that contains "x"
// GET /support?sent=1     -> same page + a "thank you" message (after sending feedback)
router.get('/support', async (req, res, next) => {
  try {
    // The keyword from the search form (method="get", input name="keyword")
    const keyword = String(req.query.keyword || '').trim().slice(0, 200);

    // Same search as GET /api/feedback?keyword=... in routes/feedback.js:
    // look for the keyword inside name, email, subject or message.
    // LIKE uses % and _ as wildcards, so we escape them to search for them literally.
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

// ---------- User profile pages ----------
// GET /login -> views/profile/login.ejs
router.get('/login', (req, res) => {
  res.render('profile/login', { title: 'Log In', active: 'profile' });
});

// GET /signup -> views/profile/add-user.ejs
router.get('/signup', (req, res) => {
  res.render('profile/add-user', { title: 'Sign Up', active: 'profile' });
});

// GET /profile?id=5 -> views/profile/profile.ejs with that user's data from the database
router.get('/profile', async (req, res, next) => {
  try {
    const id = String(req.query.id || '');

    // The id must contain only digits (e.g. "5"). If not, send the user to the login page.
    if (!/^\d+$/.test(id)) {
      return res.redirect('/login');
    }

    // LEFT JOIN: we still get the user if they have no plan (plan fields will be null)
    const [rows] = await db.query(
      `SELECT p.full_name, p.email, p.phone, p.restaurant_name,
              pl.name AS plan_name, pl.price AS plan_price, pl.duration AS plan_duration
       FROM user_profiles p
       LEFT JOIN plans pl ON pl.id = p.plan_id
       WHERE p.id = ?`,
      [id] // the ? placeholder keeps the query safe from SQL injection
    );

    // No user with this id -> 404 page
    if (rows.length === 0) {
      return res.status(404).render('404', { title: '404' });
    }

    res.render('profile/profile', {
      title: 'Profile',
      active: 'profile',
      user: rows[0]
    });
  } catch (error) {
    next(error); // pass the error to the error-handling middleware in server.js
  }
});

// ---------- Old Phase 1 URLs -> new routes ----------
// 301 = "moved permanently". Old links and bookmarks still work.
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
    // Keep any query string, so Profile.html?id=5 becomes /profile?id=5
    const queryIndex = req.originalUrl.indexOf('?');
    const query = queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex);
    res.redirect(301, oldUrls[oldUrl] + query);
  });
});

module.exports = router;
