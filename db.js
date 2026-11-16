require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dineease',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true            // dates come back as text like "2026-01-01", not Date objects
});

module.exports = pool;
