const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // References custom or default categories
  description: { type: String },
  date: { type: Date, default: Date.now },
  isShared: { type: Boolean, default: false },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
});

module.exports = mongoose.model('Expense', expenseSchema);