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
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Wallet</h2>
      <p className="text-lg mb-4">Balance: ₹{balance}</p>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleAddMoney}>
        <input
          type="number"
          placeholder="Amount to add"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Add Money</button>
      </form>
    </div>
  );
};

export default Wallet;