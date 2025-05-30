const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { processRecurringExpenses } = require('./routes/recurring');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/expense', require('./routes/expense'));
app.use('/api/recurring', require('./routes/recurring').router);
app.use('/api/budget', require('./routes/budget'));
app.use('/api/group', require('./routes/group'));
app.use('/api/category', require('./routes/category'));

// Schedule recurring expenses daily
cron.schedule('0 0 * * *', processRecurringExpenses);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));