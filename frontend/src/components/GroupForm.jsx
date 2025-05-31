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
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 max-w-md w-full mx-auto md:mx-0">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Groups & Shared Expenses</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Create Group</h3>
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input
              id="groupName"
              type="text"
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
            <select
              id="participants"
              multiple
              value={selectedParticipants}
              onChange={(e) =>
                setSelectedParticipants(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 h-32"
              required
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple participants</p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Create Group
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Add Shared Expense</h3>
        <form onSubmit={handleAddSharedExpense} className="space-y-4">
          <div>
            <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-1">Select Group</label>
            <select
              id="groupId"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              required
            >
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-gray-700 mb-4">Total Expense: <span className="font-bold text-green-600">₹{totalAmount.toFixed(2)}</span></p>
          {groups
            .find((g) => g._id === groupId)
            ?.participants.map((userId) => {
              const user = users.find((u) => u._id === userId);
              return user ? (
                <div key={user._id} className="space-y-2">
                  <label htmlFor={`contribution-${user._id}`} className="block text-sm font-medium text-gray-700">
                    {user.username}'s Contribution
                  </label>
                  <input
                    id={`contribution-${user._id}`}
                    type="number"
                    placeholder={`Enter amount for ${user.username}`}
                    value={contributions[user._id] || ''}
                    onChange={(e) => handleContributionChange(user._id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              ) : null;
            })}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              id="description"
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue speculations-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Add Shared Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupForm;
