const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

//
router.get('/dogs/:ownerId', async (req, res) => {
  const ownerId = req.params.ownerId;

  try {
    const [dogs] = await db.query(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?', [ownerId]
    );
    res.json(dogs);
  } catch (error) {
    console.error('Failed to fetch dogs:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('connect.sid');
  req.session.destroy(err => {
    if (err) {
      console.error("Session destruction failed:", err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.sendStatus(200);
  });
});

//q16
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

module.exports = router;