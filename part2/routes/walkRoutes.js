const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all walk requests (for walkers to view)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT wr.*, d.name AS dog_name, d.size, u.username AS owner_name
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ error: 'Failed to fetch walk requests' });
  }
});

// POST a new walk request (from owner)
router.post('/', async (req, res) => {
  const { dog_id, requested_time, duration_minutes, location } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location)
      VALUES (?, ?, ?, ?)
    `, [dog_id, requested_time, duration_minutes, location]);

    res.status(201).json({ message: 'Walk request created', request_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create walk request' });
  }
});

//q16
router.post('/apply/:requestId', async (req, res) => {
  const walkerId = req.session.user?.user_id;
  const requestId = req.params.requestId;

  if (!walkerId) {
    return res.status(401).json({ success: false, error: "Not logged in" });
  }

  const conn = await db.getConnection();
  try {
    await conn.query(
      `INSERT INTO WalkApplications (request_id, walker_id)
       VALUES (?, ?)`,
      [requestId, walkerId]
    );

    res.json({ success: true, message: "Applied to walk!" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: "Already applied to this walk." });
    } else {
      console.error("Apply error:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  } finally {
    conn.release();
  }
});

module.exports = router;