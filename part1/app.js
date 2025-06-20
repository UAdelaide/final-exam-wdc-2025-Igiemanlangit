var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

// -----------------
router.get('/walkers/summary', async (req, res) => {
    try {
      const db = req.app.locals.db;
      const [rows] = await db.execute(`
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
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch walker summary' });
    }
  });