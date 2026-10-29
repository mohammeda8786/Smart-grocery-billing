const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createToken = (user) => jwt.sign(
  { sub: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedName || normalizedName.length > 80) {
    return res.status(400).json({ message: 'Name must be between 1 and 80 characters' });
  }
  if (normalizedEmail.length > 254 || !emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Enter a valid email address' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name: normalizedName, email: normalizedEmail, passwordHash });
    return res.status(201).json({ message: 'Account created successfully. Please sign in.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Unable to create account' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (
    !emailPattern.test(normalizedEmail)
    || normalizedEmail.length > 254
    || typeof password !== 'string'
    || password.length > 128
  ) {
    return res.status(400).json({ message: 'Enter a valid email address and password' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({ token: createToken(user), user: serializeUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to sign in' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email');
    if (!user) {
      return res.status(401).json({ message: 'Account no longer exists' });
    }
    return res.json(serializeUser(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to verify account' });
  }
});

module.exports = router;
