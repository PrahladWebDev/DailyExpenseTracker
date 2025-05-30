import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseForm = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/category', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setCategories(res.data);
      if (res.data.length > 0) setCategory(res.data[0]);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/expense',
        { amount, category, description },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setAmount('');
      setCategory(categories[0] || '');
      setDescription('');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add expense');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Add Expense</button>
      </form>
    </div>
  );
};

export default ExpenseForm;