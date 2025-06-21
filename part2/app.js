const express = require('express');
const path = require('path');
require('dotenv').config();

//added  start --------------------------------------------------------------------------------------------------------------
const session = require('express-session'); //q16
const pool = require('./models/db');

const app = express();

app.use(session({ //q16
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 3600000 // 1 hour
    }
  }));
//added  end ----------------------------------------------------------------------------------------------------------------


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

    req.session.user = {
        user_id: user.user_id,
        role: user.role,
        username: user.username
      }; //q16

    res.json({ success: true, role: user.role, user_id: user.user_id });
});

//added  end ----------------------------------------------------------------------------------------------------------------

// Export the app instead of listening here
module.exports = app;