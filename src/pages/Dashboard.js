import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard({ token }) {
  const [invoices, setInvoices] = useState([]);
  const [gstSummary, setGstSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
    fetchGstSummary();
  }, [token]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGstSummary = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/gst-summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGstSummary(response.data);
    } catch (err) {
      console.error('Error fetching GST summary:', err);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#1a1a1a' }}>Dashboard</h1>
        <button onClick={() => navigate('/create-invoice')} className="btn btn-primary">
          Create New Invoice
        </button>
      </div>

      {gstSummary.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: '#d4af37' }}>GST Summary</h2>
          <div className="invoice-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Month</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>GST @ 3%</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>GST @ 5%</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Taxable</th>
                </tr>
              </thead>
              <tbody>
                {gstSummary.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(row.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      ₹{parseFloat(row.gst_3_percent || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      ₹{parseFloat(row.gst_5_percent || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      ₹{parseFloat(row.total_taxable || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1a1a1a' }}>Recent Invoices</h2>
      {invoices.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>No invoices yet. Create your first invoice!</p>
        </div>
      ) : (
        <div className="invoice-list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-item">
              <div className="invoice-info">
                <div className="invoice-number">{invoice.invoice_number}</div>
                <div className="invoice-customer">{invoice.customer_name || 'N/A'}</div>
                <div className="invoice-date">
                  {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div className="invoice-amount">₹{parseFloat(invoice.total_amount).toFixed(2)}</div>
              <button
                onClick={() => navigate(`/invoice/${invoice.id}`)}
                className="btn btn-primary btn-small"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
