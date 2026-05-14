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
                <select
                  value={item.item_type}
                  onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                  className="item-type-select"
                  disabled={loading}
                >
                  <option>Gold Ring</option>
                  <option>Gold Necklace</option>
                  <option>Gold Bracelet</option>
                  <option>Gold Earrings</option>
                  <option>Gold Pendant</option>
                  <option>Silver Ring</option>
                  <option>Silver Necklace</option>
                  <option>Silver Bracelet</option>
                  <option>Silver Earrings</option>
                  <option>Making Charge</option>
                </select>
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
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '200px' }}
          >
            {loading ? 'Creating...' : 'Create Invoice'}
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
    </div>
  );
}

export default CreateInvoice;
