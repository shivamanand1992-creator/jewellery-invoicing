import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import ViewInvoice from './pages/ViewInvoice';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo-section">
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#d4af37',
                letterSpacing: '2px'
              }}>
                S.S
              </div>
              <h1 className="logo">S.S. Jewellers</h1>
            </div>
            {token && (
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register setToken={setToken} />} />
          <Route path="/dashboard" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
          <Route path="/create-invoice" element={token ? <CreateInvoice token={token} /> : <Navigate to="/login" />} />
          <Route path="/invoice/:id" element={token ? <ViewInvoice token={token} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
