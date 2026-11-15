require('dotenv').config(); // Load DB_HOST, DB_PASSWORD, PORT ... from the .env file (must be the first line)

// ===================================================================
// DineEase - main server file (SE371 Phase 2)
// Node.js + Express + MySQL (mysql2) + EJS
// ===================================================================

const express = require('express');
const path = require('path');
const db = require('./db'); // shared MySQL connection pool (mysql2/promise)

// Route modules (each file uses express.Router() and module.exports)
const pageRoutes = require('./routes/pages');       // page routes: return web pages (res.render / res.sendFile)
const plansApi = require('./routes/plans');         // web API routes: return JSON only
const profilesApi = require('./routes/profiles');
const feedbackApi = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Settings ----------
app.set('view engine', 'ejs');                    // res.render('index') looks for views/index.ejs
app.set('views', path.join(__dirname, 'views'));  // where the .ejs files are

// ---------- Middleware (runs for every request, in this order) ----------

// Logging middleware: prints e.g. "GET /plans - ::1" in the terminal for every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next(); // continue to the next middleware / route
});

// Static files: anything inside public/ is sent as-is (e.g. /css/style.css, /js/login.js).
// Only public/ is served, so server.js, .env etc. can never be downloaded.
app.use(express.static(path.join(__dirname, 'public')));

// Body parsers: turn the request body into req.body
app.use(express.json());                          // JSON bodies sent by fetch()
app.use(express.urlencoded({ extended: false })); // normal HTML form submissions

// ---------- Routes ----------

// 1) Page routes: return HTML pages
app.use('/', pageRoutes);

// 2) Web API routes: return JSON only, all start with /api
app.use('/api/plans', plansApi);
app.use('/api/profiles', profilesApi);
app.use('/api/feedback', feedbackApi);

// Unknown API URL (e.g. /api/nothing) -> JSON 404, because API clients expect JSON
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Any other unknown URL -> the 404 page (must come after all other routes)
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});

// ---------- Error-handling middleware ----------
// Express knows this is an error handler because it has 4 parameters (err, req, res, next).
// Routes send errors here with next(error) or by throwing inside an async handler.
app.use((err, req, res, next) => {
  const isApi = req.originalUrl.startsWith('/api');

  // The client sent broken JSON (express.json() could not parse it)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.error(err);

  if (isApi) {
    return res.status(500).json({ error: 'Internal server error' }); // API -> JSON
  }
  res.status(500).render('error', { title: 'Error' });             // page -> error page
});

// ---------- Database check ----------
// Tests the MySQL connection once when the server starts.
async function connectToDB() {
  try {
    const connection = await db.getConnection(); // borrow one connection from the pool
    connection.release();                        // give it back straight away
    console.log('Successfully connected to database server...');
  } catch (error) {
    console.error('Could not connect to the database. Check your .env file and that MySQL is running.');
    console.error(error.message);
  }
}

// ---------- Start the server ----------
// require.main === module is true only when we run "node server.js" directly.
// The server does not start when another file does require('./server'), for example a test.
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`DineEase running at http://localhost:${PORT}`);
    await connectToDB();
  });
}

module.exports = app; // export the app so other files (e.g. tests) can use it
