# Quick Start Guide - S.S. Jewellers Invoicing System

## 5-Minute Setup

### On Your Computer

1. **Make sure PostgreSQL is running**
   - Windows: PostgreSQL should auto-start
   - Mac: `brew services start postgresql`
   - Linux: `sudo service postgresql start`

2. **Create the database**
   ```bash
   createdb jewellery_invoicing
   ```

3. **Go to the project folder and install**
   ```bash
   cd jewellery-invoicing
   npm install
   ```

4. **Start the app**
   ```bash
   npm run dev
   ```

5. **Open browser to http://localhost:3000**

### First Login

- Email: `shivamanand1992@gmail.com`
- Password: `Today@123`

The system is pre-configured with your S.S. Jewellers details.

---

## Using the System

### Creating Your First Invoice

1. Click **"Create New Invoice"**
2. Fill in:
   - Customer name (required)
   - Gold price today (required)
   - Silver price today (required)
3. Add items:
   - Select item type (Gold Ring, Silver Necklace, etc.)
   - Enter weight in grams
   - Select purity (22K, 20K, 18K for gold; 925 for silver)
   - Add gemstone price if any
   - Add making charge
4. Click **"Create Invoice"** → Done! ✅

System automatically calculates:
- Gold/Silver value based on weight × price × purity
- 3% GST on jewellery
- 5% GST on making charges
- Final total

### Downloading Invoices

- Click **"View"** on any invoice
- Click **"Download PDF"** to save to your computer
- Print or email to customer

### For Your CA (GST Filing)

- Go to **Dashboard**
- Scroll down to see **"GST Summary"** table
- This shows monthly breakdown:
  - GST @ 3% collected
  - GST @ 5% collected
  - Total taxable sales

Copy this data or take screenshots for your CA.

---

## Changing Prices Daily

Each time you create an invoice, you input:
- Today's gold price per gram
- Today's silver price per gram

The system remembers these for that invoicing session. Next day, enter new prices.

---

## Problems?

**App won't start?**
- Make sure PostgreSQL is running
- Check if port 5000/3000 are free
- Run: `npm install` again

**Can't create invoice?**
- Gold/Silver prices are required
- Customer name is required
- At least one item must be added

**PDF not downloading?**
- Try a different browser
- Check your pop-up blocker

**Forgot password?**
- You can change in code: Just edit login credentials in `src/pages/Login.js`
- Or contact Shivam

---

## What Happens Behind the Scenes?

- All invoices stored in PostgreSQL (laptop database)
- Each invoice gets unique number (INV-001, INV-002, etc.)
- QR code auto-generated with your UPI ID
- PDF created on-demand when you download

---

## Data Backup

Your invoices are stored locally in PostgreSQL. To backup:

```bash
pg_dump jewellery_invoicing > backup.sql
```

To restore:
```bash
createdb jewellery_invoicing_restored
psql jewellery_invoicing_restored < backup.sql
```

---

**That's it!** You're ready to create invoices. Start with the "Create New Invoice" button.
