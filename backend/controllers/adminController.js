const { pool } = require('../config/db');

exports.getDashboard = async (req, res, next) => {
  try {
    const [[userCountRows], [questionCountRows], [scoreCountRows], [users]] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM users'),
      pool.query('SELECT COUNT(*) AS count FROM questions'),
      pool.query('SELECT COUNT(*) AS count FROM scores'),
      pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'),
    ]);

    res.json({
      metrics: {
        users: userCountRows[0].count,
        questions: questionCountRows[0].count,
        scores: scoreCountRows[0].count,
      },
      users,
    });
  } catch (error) {
    next(error);
  }
};
