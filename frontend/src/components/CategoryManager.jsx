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
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 max-w-md w-full mx-auto md:mx-0">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Categories</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleAddCategory} className="space-y-4">
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">New Category</label>
          <input
            id="categoryName"
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          Add Category
        </button>
      </form>
      <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Existing Categories</h3>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <span className="text-gray-700">{cat}</span>
            {cat !== 'Vegetables' && cat !== 'Fruits' && cat !== 'Utensils' && cat !== 'Appliances' && cat !== 'Clothes' && cat !== 'Travel' && cat !== 'Rent' && cat !== 'Utilities' && cat !== 'Miscellaneous' && (
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
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
