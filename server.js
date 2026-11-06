const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve ONLY the front-end folders/pages (never server.js, .env, etc.)
['css', 'js', 'plans', 'user-profile'].forEach(dir =>
  app.use('/' + dir, express.static(path.join(__dirname, dir))));
app.get(['/', '/index.html'], (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/support.html', (req, res) => res.sendFile(path.join(__dirname, 'support.html')));

// ---- API ----
app.use('/api/plans', require('./routes/plans'));
app.use('/api/profiles', require('./routes/profiles'));
// (teammate: app.use('/api/feedback', require('./routes/feedback'));)

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`DineEase running at http://localhost:${PORT}`));
}
module.exports = app;
