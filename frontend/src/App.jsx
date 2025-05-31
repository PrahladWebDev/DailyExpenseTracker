import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import Register from './components/Register';
import Wallet from './components/Wallet';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Report from './components/Report';
import RecurringExpense from './components/RecurringExpense';
import BudgetForm from './components/BudgetForm';
import GroupForm from './components/GroupForm';
import CategoryManager from './components/CategoryManager';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);
      setUser(decoded.user);
      console.log(token);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
          <h1 className="text-2xl font-bold tracking-tight">PG Expense Tracker</h1>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm font-medium">Welcome, {user.username}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-gray-200 text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route
              path="/"
              element={
                user ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Wallet />
                    <ExpenseForm />
                    <RecurringExpense />
                    <BudgetForm />
                    <GroupForm />
                    <CategoryManager />
                    <ExpenseList />
                    <Report />
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
