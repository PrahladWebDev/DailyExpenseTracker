import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWallet();
    checkLowBalance();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/wallet', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setBalance(res.data.balance);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch wallet');
    }
  };

  const checkLowBalance = async () => {
    try {
      await axios.get('http://localhost:5000/api/wallet/check-balance', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
    } catch (err) {
      console.error(err);
      console.error('Failed to check balance');
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Amount must be positive');
      return;
    }
    try {
      const res = await axios.post(
        'http://localhost:5000/api/wallet/add',
        { amount },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setBalance(res.data.balance);
      setAmount('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add money');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 max-w-md w-full mx-auto md:mx-0">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Wallet</h2>
      <p className="text-lg text-gray-700 mb-4">Balance: <span className="font-bold text-green-600">₹{balance.toFixed(2)}</span></p>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleAddMoney} className="space-y-4">
        <input
          type="number"
          placeholder="Amount to add"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          Add Money
        </button>
      </form>
    </div>
  );
};

export default Wallet;
