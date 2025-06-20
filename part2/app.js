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
app.post('/api/login', async(req,res) => {
    const { email, password } = req.body;
    const conn = await pool.getConnection();
    const [users] = await conn.query(
        'SELECT * FROM Users WHERE email = ? AND password_hash = ?', [email,password]
    );
    conn.release();

    if (users.length === 0) {
        return res.json({success:false, message: "Invalid "})
    }
})
//added  end ----------------------------------------------------------------------------------------------------------------

// Export the app instead of listening here
module.exports = app;