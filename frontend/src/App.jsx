import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
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
        <nav className="bg-blue-600 p-4 text-white flex justify-between">
          <h1 className="text-xl font-bold">PG Expense Tracker</h1>
          {user && (
            <div>
              <span className="mr-4">Welcome, {user.username}</span>
              <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">Logout</button>
            </div>
          )}
        </nav>
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route
              path="/"
              element={
                user ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Wallet />
                    <ExpenseForm  />
                    <RecurringExpense />
                    <BudgetForm  />
                    <GroupForm  />
                    <CategoryManager />
                    <ExpenseList  />
                    <Report  />
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