/**
 * User model: the only file that should write raw SQL for `users`.
 * Controllers call these functions instead of touching the pool
 * directly, so query logic stays in one place as features grow.
 */
const { pool } = require('../config/db');

const PUBLIC_FIELDS = 'id, name, email, role, created_at';

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create({ name, email, passwordHash, role = 'student' }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role]
  );
  return findById(result.insertId);
}

module.exports = { findByEmail, findById, create };
