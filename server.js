require('dotenv').config(); // must be first, so process.env has the DB settings before db.js runs

// DineEase server: Express + MySQL + EJS

const express = require('express');
const path = require('path');
const db = require('./db');

// Page routes return HTML (res.render), API routes return JSON only
const pageRoutes = require('./routes/pages');
const plansApi = require('./routes/plans');
const profilesApi = require('./routes/profiles');
const feedbackApi = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Logs every request, e.g. "GET /plans - ::1"
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Only public/ is served, so files like server.js and .env can't be downloaded
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', pageRoutes);
app.use('/api/plans', plansApi);
app.use('/api/profiles', profilesApi);
app.use('/api/feedback', feedbackApi);

// 404s go after all the routes, otherwise they would catch every request.
// Unknown /api URLs get JSON, everything else gets the 404 page.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});

// Error handler: Express treats it as one because it has 4 parameters.
// Errors from next(error) end up here.
app.use((err, req, res, next) => {
  const isApi = req.originalUrl.startsWith('/api');

  // broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.error(err);

  if (isApi) {
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.status(500).render('error', { title: 'Error' });
});

// Checks the MySQL connection once on startup
async function connectToDB() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('Successfully connected to database server...');
  } catch (error) {
    console.error('Could not connect to the database. Check your .env file and that MySQL is running.');
    console.error(error.message);
  }
}

// Only start the server when we run "node server.js",
// not when another file (like a test) requires this one
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`DineEase running at http://localhost:${PORT}`);
    await connectToDB();
  });
}

module.exports = app;
