// ===================================================================
// Page routes: every route here sends back a WEB PAGE (HTML),
// with res.render (EJS views) or res.sendFile (plain HTML in pages/).
// The JSON "web API" routes are in plans.js, profiles.js and feedback.js.
// ===================================================================

const express = require('express');
const path = require('path');
const db = require('../db'); // shared MySQL connection pool

const router = express.Router();

// Folder with the plain HTML pages that are not converted to EJS yet
const pagesFolder = path.join(__dirname, '..', 'pages');

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

// ---------- Plans and Support pages (plain HTML for now) ----------
// TEMPORARY: Najlaa will replace with res.render()
router.get('/plans', (req, res) => {
  res.sendFile('plan-details.html', { root: pagesFolder });
});

// TEMPORARY: Najlaa will replace with res.render()
router.get('/plans/add', (req, res) => {
  res.sendFile('add-plan.html', { root: pagesFolder });
});

// TEMPORARY: Najlaa will replace with res.render()
router.get('/support', (req, res) => {
  res.sendFile('support.html', { root: pagesFolder });
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
