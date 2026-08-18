const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

exports.register = async (req, res) => {
  // 1. Check for validation errors from the router
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  // 2. Grab the data the user sent
  const { name, email, password, role } = req.body;

  // Default to 'student' if no role is provided
  const userRole = role || 'student';

  let connection;
  try {
    connection = await pool.getConnection();

    // 3. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save to the new Exam System database
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });

  } catch (error) {
    // Error 1062 is MySQL's code for a duplicate entry (email already exists)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error during registration' });
  } finally {
    if (connection) connection.release();
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Find the user by email
    const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // 2. Check if the password matches the hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Create the JWT Token (The digital ID card)
    // We embed the user's ID AND their ROLE inside the token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user.id, name: user.name, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  } finally {
    if (connection) connection.release();
  }
};

exports.me = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Fetch the full user profile using the ID from the token (req.user.id)
    const [users] = await connection.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send the complete user object back to the frontend
    res.json({ user: users[0] });

  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  } finally {
    if (connection) connection.release();
  }
};
