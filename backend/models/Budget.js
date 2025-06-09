// models/Budget.js

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const budgetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  spent: { type: Number, default: 0 },
});

const Budget = model('Budget', budgetSchema);

export default Budget;
