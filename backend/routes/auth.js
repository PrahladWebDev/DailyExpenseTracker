const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');


router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username, email, password });
    await user.save();

const payload = { user: { id: user.id, username: user.username } };
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
res.json({ token });

  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, username: user.username } };
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });


    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// New route to fetch all registered users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({}, '_id username').sort({ username: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;