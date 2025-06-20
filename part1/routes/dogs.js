//question 6 dog call
const express = require('express');
const router = express.Router();
const db = require('../db'); // make sure db.js exports MySQL connection

// GET /api/dogs - List all dogs
router.get('/', async (req, res) => {
    try {
        const [dogs] = await db.query(`
      SELECT d.dog_id, d.name, d.size, u.username AS owner_name
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
        res.json(dogs);
    } catch (err) {
        console.error('Error fetching dogs:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;