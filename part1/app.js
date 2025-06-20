var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

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
    user: 'root',
    password: '',
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

        console.log(' Initial data inserted.');
    } catch (err) {
        console.error(' Error inserting data:', err);
    } finally {
        conn.release();
    }
}

app.get('/api/dogs', async (req, res) => {
    try {
        const [dogs] = await pool.query(`
        SELECT d.dog_id, d.name, d.size, u.username AS owner
        FROM Dogs d
        JOIN Users u ON d.owner_id = u.user_id
      `);
        res.json(dogs);
    } catch (err) {
        console.error(' /api/dogs error:', err);
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});

router.get('/dogs', async (req, res) => {
    try {
      const db = req.app.locals.db;  // ⬅️ injected pool from app.js
      const [rows] = await db.execute(`
        SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
        FROM Dogs
        JOIN Users ON Dogs.owner_id = Users.user_id
      `);
      res.json(rows);
    } catch (err) {
      console.error('❌ /api/dogs error:', err);
      res.status(500).json({ error: 'Failed to fetch dogs' });
    }
  });


app.get('/api/walkrequests/open', async (req, res) => {
    try {
        const [rows] = await pool.query(`
        SELECT wr.request_id, wr.requested_time, wr.duration_minutes, wr.location,
               d.name AS dog_name
        FROM WalkRequests wr
        JOIN Dogs d ON wr.dog_id = d.dog_id
        WHERE wr.status = 'open'
      `);
        res.json(rows);
    } catch (err) {
        console.error(' /api/walkrequests/open error:', err);
        res.status(500).json({ error: 'Failed to fetch walk requests' });
    }
});

app.get('/api/walkers/summary', async (req, res) => {
    try {
        const [summary] = await pool.query(`
        SELECT u.username AS walker_username,
               COUNT(r.rating_id) AS total_ratings,
               ROUND(AVG(r.rating), 1) AS average_rating,
               (
                 SELECT COUNT(*)
                 FROM WalkApplications wa
                 JOIN WalkRequests wr ON wa.request_id = wr.request_id
                 WHERE wa.walker_id = u.user_id AND wr.status = 'completed'
               ) AS completed_walks
        FROM Users u
        LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
        WHERE u.role = 'walker'
        GROUP BY u.username
      `);
        res.json(summary);
    } catch (err) {
        console.error(' /api/walkers/summary error:', err);
        res.status(500).json({ error: 'Failed to fetch walker summary' });
    }
});


// Run insert on startup
insertInitialData();

// ===== Start Server =====
//runnning on 3001 because 3000 is currently used for group project and unsure to delete during exams
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});



module.exports = app;