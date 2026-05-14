import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateInvoice({ token }) {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerPan, setCustomerPan] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [silverPrice, setSilverPrice] = useState('');
  const [items, setItems] = useState([
    { item_type: 'Gold Ring', description: '', gross_weight: '', net_weight: '', purity: '22K', gemstone_price: '', making_charge_percent: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const addItem = () => {
    setItems([
      ...items,
      { item_type: 'Gold Ring', description: '', gross_weight: '', net_weight: '', purity: '22K', gemstone_price: '', making_charge_percent: '' }
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
    if (!customerName || !goldPrice || !silverPrice) {
      setError('Please fill in customer name and prices');
      return;
    }
    
    if (items.some(item => !item.net_weight && item.item_type !== 'Making Charge')) {
      setError('Please fill in net weight for all items');
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
        'http://localhost:5000/api/invoices',
        {
          customer_name: customerName,
          customer_address: customerAddress,
          customer_state: customerState,
          customer_gstin: customerGstin,
          customer_pan: customerPan,
          gold_price: parseFloat(goldPrice),
          silver_price: parseFloat(silverPrice),
          items: items.map(item => ({
            item_type: item.item_type,
            description: item.description,
            gross_weight: item.gross_weight ? parseFloat(item.gross_weight) : 0,
            net_weight: item.net_weight ? parseFloat(item.net_weight) : 0,
            purity: item.purity,
            gemstone_price: item.gemstone_price ? parseFloat(item.gemstone_price) : 0,
            making_charge_percent: item.making_charge_percent ? parseFloat(item.making_charge_percent) : 0
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
          <h2 style={{ marginBottom: '1.5rem', color: '#d4af37' }}>Today's Rates</h2>

          <div className="grid">
            <div className="form-group">
              <label>Gold Price (per gram)</label>
              <input
                type="number"
                step="0.01"
                value={goldPrice}
                onChange={(e) => setGoldPrice(e.target.value)}
                placeholder="e.g., 6500"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Silver Price (per gram)</label>
              <input
                type="number"
                step="0.01"
                value={silverPrice}
                onChange={(e) => setSilverPrice(e.target.value)}
                placeholder="e.g., 75"
                required
                disabled={loading}
              />
            </div>
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

                  <div className="grid">
                    <div className="form-group">
                      <label>Purity</label>
                      <select
                        value={item.purity}
                        onChange={(e) => handleItemChange(index, 'purity', e.target.value)}
                        disabled={loading}
                      >
                        <option>22K</option>
                        <option>20K</option>
                        <option>18K</option>
                        <option>925</option>
                      </select>
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
                  </div>
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
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '2rem'
          }}>
            <h2 style={{ textAlign: 'center', color: '#d4af37', marginBottom: '2rem' }}>Invoice Preview</h2>
            
            {/* Invoice Preview Content */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
              <h3 style={{ color: '#1a1a1a', marginBottom: '1rem' }}>Customer Details</h3>
              <p><strong>Name:</strong> {customerName}</p>
              <p><strong>Address:</strong> {customerAddress}</p>
              <p><strong>State:</strong> {customerState}</p>
              {customerGstin && <p><strong>GSTIN:</strong> {customerGstin}</p>}
              {customerPan && <p><strong>PAN:</strong> {customerPan}</p>}
            </div>

            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
              <h3 style={{ color: '#1a1a1a', marginBottom: '1rem' }}>Prices</h3>
              <p><strong>Gold Price (per gram):</strong> ₹{goldPrice}</p>
              <p><strong>Silver Price (per gram):</strong> ₹{silverPrice}</p>
            </div>

            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
              <h3 style={{ color: '#1a1a1a', marginBottom: '1rem' }}>Items</h3>
              {items.map((item, idx) => {
                let itemAmount = 0;
                if (item.item_type.includes('Gold')) {
                  const purityMap = { '22K': 0.916, '20K': 0.833, '18K': 0.75 };
                  const purity = purityMap[item.purity] || 0.916;
                  itemAmount = parseFloat(item.net_weight || 0) * parseFloat(goldPrice || 0) * purity;
                } else if (item.item_type.includes('Silver')) {
                  itemAmount = parseFloat(item.net_weight || 0) * parseFloat(silverPrice || 0) * 0.925;
                }
                if (item.gemstone_price) itemAmount += parseFloat(item.gemstone_price);
                const gstAmount = itemAmount * 0.03;
                const total = itemAmount + gstAmount;

                return (
                  <div key={idx} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <p><strong>Item {idx + 1}:</strong> {item.item_type}</p>
                    {item.description && <p><strong>Description:</strong> {item.description}</p>}
                    <p><strong>Gross Weight:</strong> {item.gross_weight}g | <strong>Net Weight:</strong> {item.net_weight}g</p>
                    <p><strong>Purity:</strong> {item.purity}</p>
                    {item.gemstone_price && <p><strong>Gemstone:</strong> ₹{item.gemstone_price}</p>}
                    <p><strong>Item Value:</strong> ₹{itemAmount.toFixed(2)}</p>
                    <p><strong>GST (3%):</strong> ₹{gstAmount.toFixed(2)}</p>
                    <p style={{ fontWeight: 'bold', color: '#d4af37' }}><strong>Total:</strong> ₹{total.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '200px' }}
              >
                {loading ? 'Creating...' : 'Confirm & Create'}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="btn btn-secondary"
                disabled={loading}
                style={{ width: '200px' }}
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
