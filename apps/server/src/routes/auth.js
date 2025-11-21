const express = require('express');
const router = express.Router();
const Database = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'videohub-secret-key-change-in-production';
const userDb = new Database('users');

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = userDb.getAll().find(
      u => u.email === email || u.username === username
    );

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = userDb.create({
      username,
      email,
      password: hashedPassword,
      avatar: username.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString()
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user;

    res.status(201).json({
      user: userData,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = userDb.getAll().find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user;

    res.json({
      user: userData,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me - Get current user (requires token)
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = userDb.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

