const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mysql = require('mysql2/promise');

const app = express();

// ===== Middleware =====
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ===== MySQL Connection =====
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_mysql_user',     // ✅ Replace with your MySQL username
  password: 'your_password',   // ✅ Replace with your MySQL password
  database: 'DogWalkService'
});

// ===== One-Time Insert Logic =====
async function insertInitialData() {
  const conn = await pool.getConnection();
  try {
    // Insert Users
    await conn.query(`
      INSERT IGNORE INTO Users (username, email, password_hash, role) VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('dawalker', 'da@example.com', 'hashed147', 'walker'),
      ('ewalker', 'e@example.com', 'hashed258', 'walker');
    `);

    // Insert Dogs
    await conn.query(`
      INSERT IGNORE INTO Dogs (name, size, owner_id)
      VALUES
      ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
      ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
      ('al', 'small', (SELECT user_id FROM Users WHERE username = 'alice123')),
      ('car', 'large', (SELECT user_id FROM Users WHERE username = 'carol123')),
      ('arol', 'large', (SELECT user_id FROM Users WHERE username = 'carol123'));
    `);

    // Insert WalkRequests
    await conn.query(`
      INSERT IGNORE INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
      VALUES
      ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 10:30:00', 5, 'small Ave', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 11:30:00', 10, 'medium Ave', 'completed'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 12:30:00', 15, 'long Ave', 'cancelled');
    `);

    console.log('✅ Initial data inserted.');
  } catch (err) {
    console.error('❌ Error inserting data:', err);
  } finally {
    conn.release();
  }
}

// Run insert on startup
insertInitialData();

// ===== Start Server =====
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

module.exports = app;