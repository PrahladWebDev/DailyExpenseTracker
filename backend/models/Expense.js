// models/Expense.js

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const expenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // References custom or default categories
  description: { type: String },
  date: { type: Date, default: Date.now },
  isShared: { type: Boolean, default: false },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
});

const Expense = model('Expense', expenseSchema);

export default Expense;
