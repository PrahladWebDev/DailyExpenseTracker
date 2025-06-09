// routes/wallet.js

import express from 'express';
import auth from '../middleware/auth.js';
import Wallet from '../models/Wallet.js';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import PDFDocument from 'pdfkit';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { amount, category, description } = req.body;
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) return res.status(400).json({ msg: 'Wallet not found' });
    if (wallet.balance < amount) return res.status(400).json({ msg: 'Insufficient balance' });

    const budget = await Budget.findOne({
      userId: req.user.id,
      category,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    if (budget && budget.spent + amount > budget.limit) {
      return res.status(400).json({ msg: `Budget limit exceeded for ${category}` });
    }

    const expense = new Expense({ userId: req.user.id, amount, category, description });
    await expense.save();

    wallet.balance -= parseFloat(amount);
    await wallet.save();

    if (budget) {
      budget.spent += parseFloat(amount);
      await budget.save();
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/report', auth, async (req, res) => {
  const { month, year } = req.query;
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: startDate, $lt: endDate },
    });

    const report = {};
    expenses.forEach(expense => {
      if (!report[expense.category]) report[expense.category] = 0;
      report[expense.category] += expense.amount;
    });

    res.json({ expenses, report });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/report/export', auth, async (req, res) => {
  const { month, year } = req.query;
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: startDate, $lt: endDate },
    });

    const report = {};
    expenses.forEach(expense => {
      if (!report[expense.category]) report[expense.category] = 0;
      report[expense.category] += expense.amount;
    });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${month}-${year}.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text(`Expense Report: ${month}/${year}`, { align: 'center' });
    doc.moveDown();
    Object.entries(report).forEach(([category, amount]) => {
      doc.fontSize(12).text(`${category}: ₹${amount}`);
    });
    doc.end();
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
