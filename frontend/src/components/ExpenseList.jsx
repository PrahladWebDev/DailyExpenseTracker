import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expense/report', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
        params: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      });
      setExpenses(res.data.expenses);
    } catch (err) {
       console.error(err);
      setError('Failed to fetch expenses');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Recent Expenses</h2>
      {error && <p className="text-red-500">{error}</p>}
      {expenses.length === 0 ? (
        <p>No expenses found</p>
      ) : (
        <ul>
          {expenses.map((expense) => (
            <li key={expense._id} className="mb-2">
              <p><strong>₹{expense.amount}</strong> - {expense.category} {expense.isShared && '(Shared)'}</p>
              <p>{expense.description}</p>
              <p>{new Date(expense.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpenseList;