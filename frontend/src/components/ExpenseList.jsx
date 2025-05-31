import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 expenses by default
  const itemsPerPage = 5;

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

  const handleSeeMore = () => {
    setVisibleCount(expenses.length); // Show all expenses
  };

  const handleSeeLess = () => {
    setVisibleCount(itemsPerPage); // Revert to initial limit
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 max-w-md w-full mx-auto md:mx-0">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Expenses</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {expenses.length === 0 ? (
        <p className="text-gray-600">No expenses found</p>
      ) : (
        <>
          <ul className="space-y-4">
            {expenses.slice(0, visibleCount).map((expense) => (
              <li
                key={expense._id}
                className="py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex justify-between items-center">
                  <p className="text-gray-700">
                    <span className="font-bold text-green-600">₹{expense.amount.toFixed(2)}</span> - {expense.category}{' '}
                    {expense.isShared && <span className="text-blue-500 text-sm">(Shared)</span>}
                  </p>
                </div>
                {expense.description && <p className="text-gray-600 text-sm mt-1">{expense.description}</p>}
                <p className="text-gray-500 text-xs mt-1">{new Date(expense.date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
          {expenses.length > itemsPerPage && (
            <div className="mt-4 flex justify-center gap-4">
              {visibleCount < expenses.length && (
                <button
                  onClick={handleSeeMore}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                >
                  See More
                </button>
              )}
              {visibleCount > itemsPerPage && (
                <button
                  onClick={handleSeeLess}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                >
                  See Less
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExpenseList;
