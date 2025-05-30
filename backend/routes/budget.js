const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

router.post('/', auth, async (req, res) => {
  const { category, limit, month, year } = req.body;
  try {
    let budget = await Budget.findOne({ userId: req.user.id, category, month, year });
    if (budget) return res.status(400).json({ msg: 'Budget already exists for this category and month' });
    budget = new Budget({ userId: req.user.id, category, limit, month, year });
    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;