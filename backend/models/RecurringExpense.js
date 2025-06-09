// models/RecurringExpense.js

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const recurringExpenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  nextDueDate: { type: Date, required: true },
});

const RecurringExpense = model('RecurringExpense', recurringExpenseSchema);

export default RecurringExpense;
