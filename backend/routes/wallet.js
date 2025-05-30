const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wallet = require('../models/Wallet');
const nodemailer = require('nodemailer');
const User = require('../models/User');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

router.get('/', auth, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id, balance: 0 });
      await wallet.save();
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/add', auth, async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ msg: 'Amount must be positive' });
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id, balance: 0 });
    }
    wallet.balance += parseFloat(amount);
    await wallet.save();
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Check low balance and send notification
router.get('/check-balance', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (wallet.balance < 500) {
      const user = await User.findById(req.user.id);
      await transporter.sendMail({
        to: user.email,
        subject: 'Low Wallet Balance',
        text: `Your balance is ₹${wallet.balance}. Please add funds.`,
      });
    }
    res.json({ msg: 'Balance checked' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;