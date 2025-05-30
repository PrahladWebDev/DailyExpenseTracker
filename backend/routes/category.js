const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');

router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  try {
    const category = new Category({ userId: req.user.id, name });
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id });
    res.json([...categories.map(c => c.name), 'Vegetables', 'Fruits', 'Utensils', 'Appliances', 'Clothes', 'Travel', 'Rent', 'Utilities', 'Miscellaneous']);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:name', auth, async (req, res) => {
  try {
    await Category.deleteOne({ userId: req.user.id, name: req.params.name });
    res.json({ msg: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;