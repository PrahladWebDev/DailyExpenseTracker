import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BudgetForm = () => {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
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
        'http://localhost:5000/api/budget',
        { category, limit, month, year },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setLimit('');
      setCategory(categories[0] || '');
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add budget');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Set Budget</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
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
          type="number"
          placeholder="Budget Limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Month (1-12)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Set Budget</button>
      </form>
    </div>
  );
};

export default BudgetForm;