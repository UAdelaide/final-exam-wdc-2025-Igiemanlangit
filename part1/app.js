//module dependencies
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

const app = express();

//middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'part1')));

//
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
});

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
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(`
            SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
            FROM Dogs
            JOIN Users ON Dogs.owner_id = Users.user_id
        `);
        conn.release();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});

app.get('/api/walkrequests/open', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(`
            SELECT WalkRequests.request_id, Dogs.name AS dog_name, WalkRequests.requested_time,
                   WalkRequests.duration_minutes, WalkRequests.location, Users.username AS owner_username
            FROM WalkRequests
            JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
            JOIN Users ON Dogs.owner_id = Users.user_id
            WHERE WalkRequests.status = 'open'
        `);
        conn.release();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch walkrequests/open' });
    }
});

app.get('/api/walkers/summary', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(`
        SELECT Users.username,
        COUNT(WalkRatings.rating_id),
        ROUND(AVG(WalkRatings.rating), 1),
        (
          SELECT COUNT(*)
          FROM WalkApplications
          JOIN WalkRequests ON WalkApplications.request_id = WalkRequests.request_id
          WHERE WalkApplications.walker_id = Users.user_id AND WalkRequests.status = 'completed'
        )
        FROM Users
        LEFT JOIN WalkRatings ON Users.user_id = WalkRatings.walker_id
        WHERE Users.role = 'walker'
        GROUP BY Users.username;
        `);
        conn.release();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch walker/summary' });
    }
});

insertInitialData();

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});

module.exports = app;