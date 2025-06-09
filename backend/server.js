// server.js (or index.js)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import connectDB from './config/db.js';
import { router as recurringRouter, processRecurringExpenses } from './routes/recurring.js';

import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import expenseRoutes from './routes/expense.js';
import budgetRoutes from './routes/budget.js';
import groupRoutes from './routes/group.js';
import categoryRoutes from './routes/category.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/recurring', recurringRouter);
app.use('/api/budget', budgetRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/category', categoryRoutes);

// Schedule recurring expenses daily at midnight
cron.schedule('0 0 * * *', processRecurringExpenses);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
