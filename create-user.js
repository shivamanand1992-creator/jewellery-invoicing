const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:GepMMIYhQCgZtHSKJRKfpjIkylIANIDm@postgres.railway.internal:5432/railway'
});

async function createUser() {
  try {
    // First, create the tables
    console.log('Creating tables...');
    
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
        weight DECIMAL(10, 2),
        purity VARCHAR(20),
        gemstone_price DECIMAL(10, 2),
        making_charge DECIMAL(10, 2),
        amount DECIMAL(12, 2),
        gst_rate DECIMAL(5, 2),
        gst_amount DECIMAL(12, 2)
      );
    `);

    console.log('✅ Tables created');

    // Hash the password
    const hashedPassword = await bcrypt.hash('Today@123', 10);

    // Insert the user
    console.log('Creating user...');
    
    const result = await pool.query(
      'INSERT INTO users (email, password, shop_name, shop_address, shop_phone, gst_number, upi_id, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email',
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

    console.log('✅ User created successfully!');
    console.log('Email:', result.rows[0].email);
    console.log('Password: Today@123');
    console.log('\n🎉 You can now login!');
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

createUser();
