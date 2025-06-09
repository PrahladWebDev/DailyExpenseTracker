import express from 'express';
import auth from '../middleware/auth.js';
import RecurringExpense from '../models/RecurringExpense.js';
import Wallet from '../models/Wallet.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js'; // You missed importing User
import nodemailer from 'nodemailer';

const router = express.Router();

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

// Process recurring expenses (run via cron or scheduler)
export const processRecurringExpenses = async () => {
  try {
    const expenses = await RecurringExpense.find({ nextDueDate: { $lte: new Date() } });
    for (const exp of expenses) {
      const wallet = await Wallet.findOne({ userId: exp.userId });
      if (wallet && wallet.balance >= exp.amount) {
        wallet.balance -= exp.amount;
        await wallet.save();

        await new Expense({ userId: exp.userId, amount: exp.amount, category: exp.category }).save();

        // Update next due date based on frequency
        const date = new Date(exp.nextDueDate);
        if (exp.frequency === 'daily') date.setDate(date.getDate() + 1);
        else if (exp.frequency === 'weekly') date.setDate(date.getDate() + 7);
        else if (exp.frequency === 'monthly') date.setMonth(date.getMonth() + 1);

        exp.nextDueDate = date;
        await exp.save();

        // Notify user by email
        const user = await User.findById(exp.userId);
        if (user && user.email) {
          await transporter.sendMail({
            to: user.email,
            subject: 'Recurring Expense Processed',
            text: `₹${exp.amount} for ${exp.category} has been deducted from your wallet.`,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing recurring expenses:', error);
  }
};

export default router;
