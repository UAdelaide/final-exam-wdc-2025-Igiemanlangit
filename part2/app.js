const express = require('express');
const path = require('path');
require('dotenv').config();

//added  start --------------------------------------------------------------------------------------------------------------
const pool = require('./models/db');
//added  end ----------------------------------------------------------------------------------------------------------------
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

//added  start --------------------------------------------------------------------------------------------------------------

//login POST route
app.post('/api/login', async(req,res) => {

    //get email and password from webpage
    const { email, password } = req.body;

    //ask mysql connection pool to give us connection to talk to database
    const conn = await pool.getConnection();

    //checks if theres a user with email and password matching
    const [users] = await conn.query(
        'SELECT * FROM Users WHERE email = ? AND password_hash = ?', [email,password]
    );
    conn.release();

    if (users.length === 0) {
        return res.json({success:false, message: "doesnt exists in database"});
    }

    const user = users[0];
    res.json({ success: true, role: user.role, user_id: user.user_id });
});

// app.get('/api/users/dogs/:ownerId', async (req, res) => {
//     const ownerId = req.params.ownerId;
//     const conn = await pool.getConnection();
//     const [dogs] = await conn.query(
//         'SELECT dog_id, name FROM Dogs WHERE owner_id = ?', [ownerId]
//     );
//     conn.release();
//     res.json(dogs);
// });

//logout function
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

//added  end ----------------------------------------------------------------------------------------------------------------

// Export the app instead of listening here
module.exports = app;