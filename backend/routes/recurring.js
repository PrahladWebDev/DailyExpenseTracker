const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RecurringExpense = require('../models/RecurringExpense');
const Wallet = require('../models/Wallet');
const Expense = require('../models/Expense');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

router.post('/', auth, async (req, res) => {
  const { amount, category, frequency, nextDueDate } = req.body;
  try {
    const recurringExpense = new RecurringExpense({
      userId: req.user.id,
      amount,
      category,
      frequency,
      nextDueDate,
    });
    await recurringExpense.save();
    res.json(recurringExpense);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Process recurring expenses (run via cron)
const processRecurringExpenses = async () => {
  const expenses = await RecurringExpense.find({ nextDueDate: { $lte: new Date() } });
  for (const exp of expenses) {
    const wallet = await Wallet.findOne({ userId: exp.userId });
    if (wallet.balance >= exp.amount) {
      wallet.balance -= exp.amount;
      await wallet.save();
      await new Expense({ userId: exp.userId, amount: exp.amount, category: exp.category }).save();
      // Update next due date
      const date = new Date(exp.nextDueDate);
      if (exp.frequency === 'daily') date.setDate(date.getDate() + 1);
      if (exp.frequency === 'weekly') date.setDate(date.getDate() + 7);
      if (exp.frequency === 'monthly') date.setMonth(date.getMonth() + 1);
      exp.nextDueDate = date;
      await exp.save();
      // Notify user
      const user = await User.findById(exp.userId);
      await transporter.sendMail({
        to: user.email,
        subject: 'Recurring Expense Processed',
        text: `₹${exp.amount} for ${exp.category} has been deducted.`,
      });
    }
  }
};

module.exports = { router, processRecurringExpenses };