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
    const { username, password } = req.body;

    const conn = await pool.getConnection();
    const [users] = await conn.query(
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?', [username, password]
    );
    conn.release();

    if (users.length === 0) {
      return res.json({ success: false, message: "Username or password is incorrect." });
    }

    const user = users[0];

    req.session.user = {
      user_id: user.user_id,
      role: user.role,
      username: user.username
    };

    res.json({ success: true, role: user.role, user_id: user.user_id });

    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: "Server error" });

    } finally {
      if (conn) conn.release();
    }
  });

//added  end ----------------------------------------------------------------------------------------------------------------

// Export the app instead of listening here
module.exports = app;