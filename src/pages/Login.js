import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Dynamic API URL - works on localhost and production
const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        maxWidth: '450px',
        width: '100%',
        padding: '3rem'
      }}>
        {/* Logo/Branding Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#000',
            margin: '0',
            letterSpacing: '2px'
          }}>
            S.S. JEWELLERS
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '0.5rem',
            letterSpacing: '1px',
            fontWeight: '500'
          }}>
            GOLD & SILVER HALLMARKED
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
          Don't have an account? <Link to="/register" style={{ color: '#d4af37', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
