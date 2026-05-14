import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register({ setToken }) {
  const [formData, setFormData] = useState({
    email: 'shivamanand1992@gmail.com',
    password: 'Today@123',
    shop_name: 'S.S. JEWELLERS',
    shop_address: 'Shop No. 3, 103, Pocket-F22, Sector-3, Rohini, Delhi (Opp. New Bal Bharti School)',
    shop_phone: '9210112528',
    gst_number: '07AENPA8746C1ZJ',
    upi_id: 'paytm.s1x8mnm@pty',
    state: 'Delhi'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);

      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
        maxWidth: '550px',
        width: '100%',
        padding: '3rem'
      }}>
        {/* Logo/Branding Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#d4af37',
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
          <div className="grid">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Shop Name</label>
            <input
              type="text"
              name="shop_name"
              value={formData.shop_name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Shop Address</label>
            <textarea
              name="shop_address"
              value={formData.shop_address}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="grid">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="shop_phone"
                value={formData.shop_phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid">
            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                name="upi_id"
                value={formData.upi_id}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#d4af37', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
