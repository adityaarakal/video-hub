const express = require('express');
const router = express.Router();
const Database = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateRegister, validateLogin, asyncHandler } = require('../middleware/validation');

const JWT_SECRET = process.env.JWT_SECRET || 'videohub-secret-key-change-in-production';
const userDb = new Database('users');

// POST /api/auth/register - Register new user
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const allUsers = await userDb.getAll();
  const existingUser = allUsers.find(
    u => u.email === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
  );

  if (existingUser) {
    return res.status(400).json({ error: 'User with this email or username already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userDb.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    avatar: username.charAt(0).toUpperCase(),
    role: 'user', // Default role
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
}));

// POST /api/auth/login - Login user
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const allUsers = await userDb.getAll();
  const user = allUsers.find(u => u.email === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
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
}));

// GET /api/auth/me - Get current user (requires token)
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userDb.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}));

module.exports = router;

