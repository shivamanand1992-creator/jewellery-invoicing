import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE_URL from '../config/api';

function ViewInvoice({ token }) {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoice();
  }, [id, token]);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoice(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      alert('Error downloading PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading invoice...</div></div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;
  if (!invoice) return <div className="container"><div className="error-message">Invoice not found</div></div>;

  // Calculate totals by GST rate
  let gst3Amount = 0;
  let gst5Amount = 0;
  let jewellerySubtotal = 0;
  let makingSubtotal = 0;

  invoice.items.forEach(item => {
    if (item.gst_rate === 3) {
      gst3Amount += parseFloat(item.gst_amount);
      jewellerySubtotal += parseFloat(item.amount);
    } else if (item.gst_rate === 5) {
      gst5Amount += parseFloat(item.gst_amount);
      makingSubtotal += parseFloat(item.amount);
    }
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#1a1a1a' }}>Invoice {invoice.invoice_number}</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={downloadPDF}
            className="btn btn-primary"
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Back
          </button>
        </div>
      </div>

      <div className="invoice-preview">
        <div className="invoice-header">
          <h1>S.S. JEWELLERS</h1>
          <p>GOLD & SILVER HALLMARKED JEWELLERY</p>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            Shop No. 3, 103, Pocket-F22, Sector-3, Rohini, Delhi
          </p>
        </div>

        <div className="invoice-details">
          <div className="detail-box">
            <div className="detail-label">Invoice Number</div>
            <div className="detail-value">{invoice.invoice_number}</div>
          </div>
          <div className="detail-box">
            <div className="detail-label">Invoice Date</div>
            <div className="detail-value">
              {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
            </div>
          </div>
          <div className="detail-box">
            <div className="detail-label">Total Amount</div>
            <div className="detail-value" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              ₹{parseFloat(invoice.total_amount).toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3 style={{ color: '#1a1a1a', marginBottom: '1rem' }}>Bill To</h3>
          <p><strong>{invoice.customer_name}</strong></p>
          {invoice.customer_address && <p>{invoice.customer_address}</p>}
          {invoice.customer_state && <p>State: {invoice.customer_state}</p>}
          {invoice.customer_gstin && <p>GSTIN: {invoice.customer_gstin}</p>}
          {invoice.customer_pan && <p>PAN: {invoice.customer_pan}</p>}
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'right' }}>Weight</th>
              <th style={{ textAlign: 'right' }}>Purity</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'right' }}>GST %</th>
              <th style={{ textAlign: 'right' }}>GST Amount</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.description || item.item_type}</td>
                <td style={{ textAlign: 'right' }}>{item.weight ? `${item.weight}g` : '-'}</td>
                <td style={{ textAlign: 'right' }}>{item.purity || '-'}</td>
                <td style={{ textAlign: 'right' }}>₹{parseFloat(item.amount).toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>{item.gst_rate}%</td>
                <td style={{ textAlign: 'right' }}>₹{parseFloat(item.gst_amount).toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>₹{(parseFloat(item.amount) + parseFloat(item.gst_amount)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary-box">
          <div className="summary-row">
            <span>Jewellery Value (Gold/Silver):</span>
            <span>₹{jewellerySubtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>GST @ 3% (on Jewellery):</span>
            <span>₹{gst3Amount.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Making Charges:</span>
            <span>₹{makingSubtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>GST @ 5% (on Making):</span>
            <span>₹{gst5Amount.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>TOTAL AMOUNT:</span>
            <span>₹{parseFloat(invoice.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
          <p style={{ marginBottom: '0.5rem' }}>UPI: paytm.s1x8mnm@pty</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Scan & Pay</p>
        </div>
      </div>

      <div className="action-buttons">
        <button
          onClick={downloadPDF}
          className="btn btn-primary"
          disabled={downloading}
        >
          {downloading ? 'Downloading...' : 'Download as PDF'}
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ViewInvoice;
