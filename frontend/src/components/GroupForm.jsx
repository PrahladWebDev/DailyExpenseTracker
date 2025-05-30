import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroupForm = () => {
  const [name, setName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [contributions, setContributions] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchGroups();
    fetchCategories();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users',err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/group', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setGroups(res.data);
      if (res.data.length > 0) setGroupId(res.data[0]._id);
    } catch (err) {
      setError('Failed to fetch groups',err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/category', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setCategories(res.data);
      if (res.data.length > 0) setCategory(res.data[0]);
    } catch (err) {
      setError('Failed to fetch categories',err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/group',
        { name, participantIds: selectedParticipants },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setName('');
      setSelectedParticipants([]);
      fetchGroups();
      setError('');
    } catch (err) {
      setError('Failed to create group',err);
    }
  };

  const handleAddSharedExpense = async (e) => {
    e.preventDefault();
    const totalAmount = Object.values(contributions).reduce((sum, val) => sum + parseFloat(val || 0), 0);
    if (totalAmount <= 0) {
      setError('Total contributions must be positive');
      return;
    }
    try {
      await axios.post(
        'http://localhost:5000/api/group/expense',
        { groupId, amount: totalAmount, category, description, contributions },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setCategory(categories[0] || '');
      setDescription('');
      setContributions({});
      setError('');
      window.location.reload();
    } catch (err) {
      setError('Failed to add shared expense',err);
    }
  };

  const handleContributionChange = (userId, value) => {
    setContributions((prev) => ({
      ...prev,
      [userId]: value,
    }));
  };

  const totalAmount = Object.values(contributions).reduce((sum, val) => sum + parseFloat(val || 0), 0);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">Manage Groups & Shared Expenses</h2>
      {error && <p className="text-red-500">{error}</p>}
      <h3 className="text-lg font-bold mb-2">Create Group</h3>
      <form onSubmit={handleCreateGroup}>
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <select
          multiple
          value={selectedParticipants}
          onChange={(e) =>
            setSelectedParticipants(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
          className="w-full p-2 mb-4 border rounded h-32"
          required
        >
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username}
            </option>
          ))}
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mb-4">
          Create Group
        </button>
      </form>
      <h3 className="text-lg font-bold mb-2">Add Shared Expense</h3>
      <form onSubmit={handleAddSharedExpense}>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        >
          <option value="">Select Group</option>
          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
        <p className="mb-4">Total Expense: ₹{totalAmount.toFixed(2)}</p>
        {groups
          .find((g) => g._id === groupId)
          ?.participants.map((userId) => {
            const user = users.find((u) => u._id === userId);
            return user ? (
              <div key={user._id} className="mb-4">
                <label className="block text-sm font-medium">
                  {user.username}'s Contribution
                </label>
                <input
                  type="number"
                  placeholder={`Amount for ${user.username}`}
                  value={contributions[user._id] || ''}
                  onChange={(e) => handleContributionChange(user._id, e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            ) : null;
          })}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Add Shared Expense
        </button>
      </form>
    </div>
  );
};

export default GroupForm;