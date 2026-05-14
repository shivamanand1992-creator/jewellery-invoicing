import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

function CreateInvoice({ token }) {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerPan, setCustomerPan] = useState('');
  const [items, setItems] = useState([
    { item_type: 'Gold Ring', description: '', gross_weight: '', net_weight: '', selling_price_per_gram: '', gemstone_price: '', making_charge_percent: '', flat_price: '', use_flat_price: false }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const navigate = useNavigate();

  const addItem = () => {
    setItems([
      ...items,
      { item_type: 'Gold Ring', description: '', gross_weight: '', net_weight: '', selling_price_per_gram: '', gemstone_price: '', making_charge_percent: '', flat_price: '', use_flat_price: false }
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!customerName) {
      setError('Please fill in customer name');
      return;
    }

    // Validate selling prices and weights for non-flat-price items
    if (items.some(item => !item.use_flat_price && !item.selling_price_per_gram)) {
      setError('Please fill in selling price for weight-based items');
      return;
    }
    
    if (items.some(item => !item.use_flat_price && !item.net_weight && item.item_type !== 'Making Charge')) {
      setError('Please fill in net weight for weight-based items');
      return;
    }

    // Validate flat price for flat-price items
    if (items.some(item => item.use_flat_price && !item.flat_price)) {
      setError('Please fill in total price for flat-price items');
      return;
    }
    
    setShowPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/invoices`,
        {
          customer_name: customerName,
          customer_address: customerAddress,
          customer_state: customerState,
          customer_gstin: customerGstin,
          customer_pan: customerPan,
          items: items.map(item => ({
            item_type: item.item_type,
            description: item.description,
            gross_weight: item.gross_weight ? parseFloat(item.gross_weight) : 0,
            net_weight: item.net_weight ? parseFloat(item.net_weight) : 0,
            selling_price_per_gram: item.selling_price_per_gram ? parseFloat(item.selling_price_per_gram) : 0,
            gemstone_price: item.gemstone_price ? parseFloat(item.gemstone_price) : 0,
            making_charge_percent: item.making_charge_percent ? parseFloat(item.making_charge_percent) : 0,
            flat_price: item.flat_price ? parseFloat(item.flat_price) : 0,
            use_flat_price: item.use_flat_price
          }))
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate(`/invoice/${response.data.invoiceId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#1a1a1a' }}>Create Invoice</h1>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: '#d4af37' }}>Customer Details</h2>

          <div className="grid">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={customerState}
                onChange={(e) => setCustomerState(e.target.value)}
                placeholder="e.g., Delhi"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Customer GSTIN (Optional)</label>
            <input
              type="text"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Customer PAN (Optional)</label>
            <input
              type="text"
              value={customerPan}
              onChange={(e) => setCustomerPan(e.target.value)}
              placeholder="e.g., AAAAA0000A"
              maxLength="10"
              disabled={loading}
            />
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: '#d4af37' }}>Items</h2>

          {items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="item-header">
                <input
                  type="text"
                  value={item.item_type}
                  onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                  placeholder="e.g., Gold Ring, Silver Necklace, Making Charge"
                  disabled={loading}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="remove-btn"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="e.g., 22K Gold Ring with Diamond"
                  disabled={loading}
                />
              </div>

              {item.item_type !== 'Making Charge' && (
                <>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={item.use_flat_price}
                        onChange={(e) => handleItemChange(index, 'use_flat_price', e.target.checked)}
                        disabled={loading}
                      />
                      <span>Use flat price (for Silver 925, etc.)</span>
                    </label>
                  </div>

                  {!item.use_flat_price ? (
                    <>
                      <div className="grid">
                        <div className="form-group">
                          <label>Gross Weight (grams)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.gross_weight}
                            onChange={(e) => handleItemChange(index, 'gross_weight', e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div className="form-group">
                          <label>Net Weight (grams)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.net_weight}
                            onChange={(e) => handleItemChange(index, 'net_weight', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Selling Price (per gram)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.selling_price_per_gram}
                          onChange={(e) => handleItemChange(index, 'selling_price_per_gram', e.target.value)}
                          placeholder="Already accounts for purity"
                          disabled={loading}
                        />
                      </div>

                      <div className="form-group">
                        <label>Gemstone Price (if any)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.gemstone_price}
                          onChange={(e) => handleItemChange(index, 'gemstone_price', e.target.value)}
                          placeholder="0"
                          disabled={loading}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label>Total Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.flat_price}
                        onChange={(e) => handleItemChange(index, 'flat_price', e.target.value)}
                        placeholder="Enter total price for this item"
                        disabled={loading}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="form-group">
                <label>Making Charge (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={item.making_charge_percent}
                  onChange={(e) => handleItemChange(index, 'making_charge_percent', e.target.value)}
                  placeholder="e.g., 7 for 7%"
                  disabled={loading}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="btn btn-secondary"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            + Add Item
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button
            type="button"
            onClick={handlePreview}
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '200px', backgroundColor: '#d4af37' }}
          >
            Preview Invoice
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            disabled={loading}
            style={{ width: '200px' }}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '2rem',
            fontFamily: 'Arial, sans-serif'
          }}>
            {/* Invoice Preview - Looks like PDF */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #d4af37' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000', letterSpacing: '2px' }}>S.S</div>
                <div style={{ fontSize: '14px', color: '#000', letterSpacing: '2px', fontWeight: '500' }}>JEWELLERS</div>
              </div>
              <p style={{ textAlign: 'center', margin: '0.5rem 0', fontSize: '12px', fontWeight: 'bold' }}>GOLD & SILVER HALLMARKED JEWELLERY</p>
              <p style={{ textAlign: 'center', margin: '0.25rem 0', fontSize: '11px' }}>Shop No. 3, 103, Pocket-F22, Sector-3, Rohini, Delhi</p>
              <p style={{ textAlign: 'center', margin: '0.25rem 0', fontSize: '11px' }}>Phone: 9210112528 | GSTIN: 07AENPA8746C1ZJ</p>
              <p style={{ textAlign: 'center', margin: '0.5rem 0 0 0', fontSize: '11px' }}>Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>

            <h3 style={{ textAlign: 'center', color: '#d4af37', marginBottom: '1.5rem' }}>TAX INVOICE</h3>

            {/* Customer Details */}
            <div style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <strong>Bill To:</strong>
              <p style={{ margin: '0.5rem 0 0 0' }}>{customerName}</p>
              {customerAddress && <p style={{ margin: '0.25rem 0' }}>{customerAddress}</p>}
              {customerState && <p style={{ margin: '0.25rem 0' }}>State: {customerState}</p>}
              {customerGstin && <p style={{ margin: '0.25rem 0' }}>GSTIN: {customerGstin}</p>}
              {customerPan && <p style={{ margin: '0.25rem 0' }}>PAN: {customerPan}</p>}
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', marginBottom: '1.5rem', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #333' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>HSN</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Gross Wt</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Net Wt</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Gem Price</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  let itemAmount = 0;
                  if (item.use_flat_price) {
                    itemAmount = parseFloat(item.flat_price || 0);
                  } else {
                    // Calculate using NET WEIGHT × SELLING PRICE PER GRAM
                    itemAmount = parseFloat(item.net_weight || 0) * parseFloat(item.selling_price_per_gram || 0);
                    if (item.gemstone_price) itemAmount += parseFloat(item.gemstone_price);
                  }
                  const gstAmount = itemAmount * 0.03;
                  const total = itemAmount + gstAmount;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '0.5rem', textAlign: 'left' }}>{item.item_type}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {item.item_type.includes('Silver') ? '711311' : '711319'}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        {item.use_flat_price ? '-' : `${item.gross_weight}g`}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        {item.use_flat_price ? '-' : `${item.net_weight}g`}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        {item.gemstone_price ? `₹${parseFloat(item.gemstone_price).toFixed(2)}` : '-'}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{itemAmount.toFixed(2)}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>₹{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary */}
            <div style={{ marginBottom: '1.5rem', paddingLeft: '50%', fontSize: '12px' }}>
              {(() => {
                const jewelSubtotal = items.reduce((sum, item) => {
                  let amt = item.use_flat_price ? parseFloat(item.flat_price || 0) : (parseFloat(item.net_weight || 0) * parseFloat(item.selling_price_per_gram || 0));
                  if (!item.use_flat_price && item.gemstone_price) amt += parseFloat(item.gemstone_price);
                  return sum + amt;
                }, 0);
                const jewelGST = jewelSubtotal * 0.03;
                const makingCharge = jewelSubtotal * 0.10; // 10%
                const makingGST = makingCharge * 0.05; // 5% on making charge
                const total = jewelSubtotal + jewelGST + makingCharge + makingGST;
                
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #ddd' }}>
                      <span>Jewellery Subtotal:</span>
                      <span>₹{jewelSubtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                      <span>GST (3%):</span>
                      <span>₹{jewelGST.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #ddd' }}>
                      <span>Making Charge (10%):</span>
                      <span>₹{makingCharge.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 'bold', color: '#d4af37' }}>
                      <span>GST on Making (5%):</span>
                      <span>₹{makingGST.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', paddingTop: '0.5rem', borderTop: '2px solid #333' }}>
                      <span>TOTAL:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  handleSubmit(new Event('submit'));
                }}
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '180px' }}
              >
                {loading ? 'Creating...' : 'Confirm & Create'}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="btn btn-secondary"
                disabled={loading}
                style={{ width: '180px' }}
              >
                Edit Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateInvoice;
