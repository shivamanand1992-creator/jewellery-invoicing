const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const path = require('path');
const { PassThrough } = require('stream');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from dist folder in production
const isDev = process.env.NODE_ENV !== 'production';
if (!isDev) {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jewellery_invoicing',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Database initialization
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        shop_name VARCHAR(255),
        shop_address TEXT,
        shop_phone VARCHAR(20),
        gst_number VARCHAR(50),
        upi_id VARCHAR(100),
        state VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255),
        customer_address TEXT,
        customer_state VARCHAR(50),
        customer_gstin VARCHAR(50),
        customer_pan VARCHAR(10),
        gold_price DECIMAL(10, 2),
        silver_price DECIMAL(10, 2),
        invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(12, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        item_type VARCHAR(50),
        description VARCHAR(255),
        gross_weight DECIMAL(10, 3),
        net_weight DECIMAL(10, 3),
        purity VARCHAR(20),
        gemstone_price DECIMAL(10, 2),
        making_charge DECIMAL(10, 2),
        amount DECIMAL(12, 2),
        gst_rate DECIMAL(5, 2),
        gst_amount DECIMAL(12, 2)
      );
    `);

    console.log('Database initialized');
  } catch (err) {
    console.error('DB init error:', err);
  }
};

// Initialize database and create default user if needed
const initDBWithDefaultUser = async () => {
  try {
    await initDB();
    
    // Check if default user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['shivamanand1992@gmail.com']);
    
    if (userCheck.rows.length === 0) {
      // Create default user
      const hashedPassword = await bcrypt.hash('Today@123', 10);
      await pool.query(
        'INSERT INTO users (email, password, shop_name, shop_address, shop_phone, gst_number, upi_id, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          'shivamanand1992@gmail.com',
          hashedPassword,
          'S.S. JEWELLERS',
          'Shop No. 3, 103, Pocket-F22, Sector-3, Rohini, Delhi',
          '9210112528',
          '07AENPA8746C1ZJ',
          'paytm.s1x8mnm@pty',
          'Delhi'
        ]
      );
      console.log('✅ Default user created');
    }
  } catch (err) {
    console.error('Initialization error:', err);
  }
};

initDBWithDefaultUser();

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, shop_name, shop_address, shop_phone, gst_number, upi_id, state } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, shop_name, shop_address, shop_phone, gst_number, upi_id, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email',
      [email, hashedPassword, shop_name, shop_address, shop_phone, gst_number, upi_id, state]
    );
    
    const token = jwt.sign({ id: result.rows[0].id }, JWT_SECRET);
    res.json({ token, user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });
    
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, shop_name: user.shop_name } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user details
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create invoice
app.post('/api/invoices', verifyToken, async (req, res) => {
  try {
    const { customer_name, customer_address, customer_state, customer_gstin, customer_pan, gold_price, silver_price, items } = req.body;
    
    // Get next invoice number
    const invoiceResult = await pool.query(
      'SELECT COUNT(*) as count FROM invoices WHERE user_id = $1',
      [req.userId]
    );
    const invoiceNumber = `INV-${String(invoiceResult.rows[0].count + 1).padStart(3, '0')}`;
    
    let totalAmount = 0;
    
    const result = await pool.query(
      'INSERT INTO invoices (user_id, invoice_number, customer_name, customer_address, customer_state, customer_gstin, customer_pan, gold_price, silver_price, total_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [req.userId, invoiceNumber, customer_name, customer_address, customer_state, customer_gstin, customer_pan, gold_price, silver_price, 0]
    );
    
    const invoiceId = result.rows[0].id;
    
    // Calculate and insert items
    let jewelTotal = 0; // Total jewellery value before making charge
    
    // First pass: calculate jewellery totals using NET WEIGHT
    for (const item of items) {
      if (item.item_type !== 'Making Charge') {
        let itemAmount = 0;
        // Calculate jewellery value using NET WEIGHT
        if (item.item_type === 'Gold' || item.item_type === 'Gold Ring' || item.item_type.includes('Gold')) {
          const purityMap = { '22K': 0.916, '20K': 0.833, '18K': 0.75 };
          const purity = purityMap[item.purity] || 0.916;
          itemAmount = parseFloat(item.net_weight) * gold_price * purity;
        } else if (item.item_type === 'Silver' || item.item_type.includes('Silver')) {
          itemAmount = parseFloat(item.net_weight) * silver_price * 0.925;
        }
        
        if (item.gemstone_price) {
          itemAmount += parseFloat(item.gemstone_price);
        }
        
        jewelTotal += itemAmount;
      }
    }
    
    // Second pass: insert items and calculate making charge
    for (const item of items) {
      let itemAmount = 0;
      let gstRate = 0;
      
      if (item.item_type === 'Making Charge') {
        gstRate = 5;
        itemAmount = parseFloat(item.making_charge) || 0;
      } else {
        gstRate = 3;
        // Calculate jewellery value using NET WEIGHT
        if (item.item_type === 'Gold' || item.item_type === 'Gold Ring' || item.item_type.includes('Gold')) {
          const purityMap = { '22K': 0.916, '20K': 0.833, '18K': 0.75 };
          const purity = purityMap[item.purity] || 0.916;
          itemAmount = parseFloat(item.net_weight) * gold_price * purity;
        } else if (item.item_type === 'Silver' || item.item_type.includes('Silver')) {
          itemAmount = parseFloat(item.net_weight) * silver_price * 0.925;
        }
        
        if (item.gemstone_price) {
          itemAmount += parseFloat(item.gemstone_price);
        }
      }
      
      const gstAmount = itemAmount * (gstRate / 100);
      const finalAmount = itemAmount + gstAmount;
      totalAmount += finalAmount;
      
      // Store making_charge_percent if provided
      const makingChargePercent = item.making_charge_percent || 0;
      
      await pool.query(
        'INSERT INTO invoice_items (invoice_id, item_type, description, gross_weight, net_weight, purity, gemstone_price, making_charge, amount, gst_rate, gst_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [invoiceId, item.item_type, item.description || '', item.gross_weight || 0, item.net_weight || 0, item.purity || '', item.gemstone_price || 0, makingChargePercent, itemAmount, gstRate, gstAmount]
      );
    }
    
    // Add making charge based on percentage
    const makingChargeItem = items.find(i => i.item_type === 'Making Charge' || i.making_charge_percent);
    if (makingChargeItem && makingChargeItem.making_charge_percent) {
      const makingChargePercent = parseFloat(makingChargeItem.making_charge_percent);
      const makingChargeAmount = (jewelTotal * makingChargePercent) / 100;
      const makingChargeGST = (makingChargeAmount * 5) / 100;
      totalAmount += makingChargeAmount + makingChargeGST;
      
      await pool.query(
        'INSERT INTO invoice_items (invoice_id, item_type, description, gross_weight, net_weight, purity, gemstone_price, making_charge, amount, gst_rate, gst_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [invoiceId, 'Making Charge', `${makingChargePercent}% Making`, 0, 0, '', 0, makingChargePercent, makingChargeAmount, 5, makingChargeGST]
      );
    }
    
    // Update total amount
    await pool.query('UPDATE invoices SET total_amount = $1 WHERE id = $2', [totalAmount, invoiceId]);
    
    res.json({ invoiceId, invoiceNumber, totalAmount });
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get all invoices for user
app.get('/api/invoices', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single invoice with items
app.get('/api/invoices/:id', verifyToken, async (req, res) => {
  try {
    const invoice = await pool.query(
      'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    if (invoice.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    
    const items = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1',
      [req.params.id]
    );
    
    res.json({ ...invoice.rows[0], items: items.rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Generate PDF for invoice
app.get('/api/invoices/:id/pdf', verifyToken, async (req, res) => {
  try {
    const invoiceResult = await pool.query(
      'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    if (invoiceResult.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    
    const invoice = invoiceResult.rows[0];
    const itemsResult = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [req.params.id]);
    const items = itemsResult.rows;
    
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = userResult.rows[0];
    
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
    doc.pipe(res);
    
    // Add logo image
    try {
      doc.image('./public/logo.png', 50, 20, { width: 150 });
    } catch (err) {
      console.log('Logo not found, continuing without it');
    }
    
    // Header (move down to make space for logo)
    doc.fontSize(20).font('Helvetica-Bold').text(user.shop_name, 50, 180);
    doc.fontSize(10).font('Helvetica').text('GOLD & SILVER HALLMARKED JEWELLERY', 50, 205);
    doc.fontSize(10).text(`Shop Address: ${user.shop_address}`, 50, 220);
    doc.fontSize(10).text(`Phone: ${user.shop_phone}`, 50, 235);
    if (user.gst_number) doc.fontSize(10).text(`GSTIN: ${user.gst_number}`, 50, 250);
    
    doc.fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', 350, 40);
    
    doc.fontSize(10).font('Helvetica').text(`Invoice No: ${invoice.invoice_number}`, 50, 285);
    doc.fontSize(10).text(`Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 50, 300);
    
    // Customer details
    doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50, 325);
    doc.fontSize(10).font('Helvetica').text(`Name: ${invoice.customer_name}`, 50, 340);
    if (invoice.customer_address) doc.fontSize(10).text(`Address: ${invoice.customer_address}`, 50, 355);
    if (invoice.customer_state) doc.fontSize(10).text(`State: ${invoice.customer_state}`, 50, 370);
    if (invoice.customer_gstin) doc.fontSize(10).text(`GSTIN: ${invoice.customer_gstin}`, 50, 385);
    if (invoice.customer_pan) doc.fontSize(10).text(`PAN: ${invoice.customer_pan}`, 50, 400);
    
    // Table header
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Item', 50, 425);
    doc.text('Weight', 150, 425);
    doc.text('Purity', 210, 425);
    doc.text('Amount', 270, 425);
    doc.text('GST %', 340, 425);
    doc.text('GST Amt', 390, 425);
    doc.text('Total', 450, 425);
    
    doc.moveTo(50, 440).lineTo(520, 440).stroke();
    
    // Items
    let y = 310;
    let jewelGSTAmount = 0;
    let makingGSTAmount = 0;
    
    for (const item of items) {
      doc.fontSize(9).font('Helvetica');
      doc.text(item.description || item.item_type, 50, y);
      doc.text(item.weight ? item.weight.toString() : '-', 150, y);
      doc.text(item.purity || '-', 210, y);
      doc.text(`₹${item.amount.toFixed(2)}`, 270, y);
      doc.text(`${item.gst_rate}%`, 340, y);
      doc.text(`₹${item.gst_amount.toFixed(2)}`, 390, y);
      doc.text(`₹${(parseFloat(item.amount) + parseFloat(item.gst_amount)).toFixed(2)}`, 450, y);
      
      if (item.gst_rate === 3) {
        jewelGSTAmount += parseFloat(item.gst_amount);
      } else if (item.gst_rate === 5) {
        makingGSTAmount += parseFloat(item.gst_amount);
      }
      
      y += 20;
    }
    
    doc.moveTo(50, y).lineTo(520, y).stroke();
    y += 15;
    
    // Summary
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Summary:', 50, y);
    y += 20;
    
    doc.fontSize(9).font('Helvetica');
    doc.text(`GST @ 3% (Gold/Silver): ₹${jewelGSTAmount.toFixed(2)}`, 270, y);
    y += 15;
    doc.text(`GST @ 5% (Making Charge): ₹${makingGSTAmount.toFixed(2)}`, 270, y);
    y += 15;
    
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Total Amount: ₹${invoice.total_amount.toFixed(2)}`, 270, y);
    
    // QR Code
    if (user.upi_id) {
      const upiString = `upi://pay?pa=${user.upi_id}&pn=${encodeURIComponent(user.shop_name)}&am=${invoice.total_amount}&tn=Invoice%20${invoice.invoice_number}`;
      QRCode.toDataURL(upiString, { errorCorrectionLevel: 'H', width: 100 }).then(qrUrl => {
        const base64Data = qrUrl.split(',')[1];
        doc.image(Buffer.from(base64Data, 'base64'), 50, y + 40, { width: 100 });
        doc.fontSize(9).text(`UPI: ${user.upi_id}`, 160, y + 50);
        doc.end();
      });
    } else {
      doc.end();
    }
  } catch (err) {
    console.error('PDF error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get GST summary
app.get('/api/gst-summary', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', i.invoice_date) as month,
        SUM(CASE WHEN ii.gst_rate = 3 THEN ii.gst_amount ELSE 0 END) as gst_3_percent,
        SUM(CASE WHEN ii.gst_rate = 5 THEN ii.gst_amount ELSE 0 END) as gst_5_percent,
        SUM(ii.amount) as total_taxable
      FROM invoices i
      JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE i.user_id = $1
      GROUP BY DATE_TRUNC('month', i.invoice_date)
      ORDER BY month DESC
    `, [req.userId]);
    
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve React app for all other routes (SPA)
app.use((req, res) => {
  if (!isDev) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
