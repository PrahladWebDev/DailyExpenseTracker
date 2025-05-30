import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryManager = () => {
  const [name, setName] = useState('');
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
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/category',
        { name },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setName('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    try {
      await axios.delete(`http://localhost:5000/api/category/${categoryName}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete category');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder="New Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Add Category</button>
      </form>
      <h3 className="text-lg font-bold mt-4 mb-2">Existing Categories</h3>
      <ul>
        {categories.map((cat) => (
          <li key={cat} className="flex justify-between mb-2">
            {cat}
            {cat !== 'Vegetables' && cat !== 'Fruits' && cat !== 'Utensils' && cat !== 'Appliances' && cat !== 'Clothes' && cat !== 'Travel' && cat !== 'Rent' && cat !== 'Utilities' && cat !== 'Miscellaneous' && (
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="text-red-500"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager;