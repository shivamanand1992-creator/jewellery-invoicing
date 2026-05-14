# S.S. Jewellers - Invoicing System

A professional invoicing system built specifically for jewellery shops in India, with automatic GST calculation (3% for jewellery, 5% for making charges), QR code generation for UPI payments, and invoice storage for CA GST filing.

## Features

✅ **Customer Management** – Store customer details, addresses, GST numbers
✅ **Item-wise Invoicing** – Gold/Silver/Gemstone items with weight and purity tracking
✅ **Auto GST Calculation** – 3% GST on jewellery, 5% on making charges
✅ **Price Management** – Daily gold/silver price input
✅ **PDF Generation** – Download invoices as professional PDFs
✅ **Invoice History** – All invoices stored and searchable
✅ **GST Summary Reports** – Monthly breakdown for CA filing
✅ **UPI QR Code** – Automatic QR code on invoices for customer payments
✅ **Multi-user Support** – Multiple jewellers can use the same system

## Tech Stack

- **Backend:** Node.js + Express.js
- **Frontend:** React.js
- **Database:** PostgreSQL
- **PDF Generation:** pdfkit
- **QR Code:** qrcode library
- **Authentication:** JWT

## Local Setup

### Prerequisites
- Node.js (v14+)
- PostgreSQL installed locally
- npm

### Step 1: Install Dependencies
```bash
cd jewellery-invoicing
npm install
```

### Step 2: Setup Database

Create a PostgreSQL database:
```bash
createdb jewellery_invoicing
```

The app will auto-create tables on first run.

### Step 3: Create .env file

Create a `.env` file in the root directory:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/jewellery_invoicing
JWT_SECRET=your-secret-key-change-this
PORT=5000
```

### Step 4: Run the Application

**Development mode** (runs both server and client):
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

Or run separately:
```bash
# Terminal 1
npm run start-server

# Terminal 2
npm run start-client
```

### Step 5: Login

First time, you'll see the register page. Pre-filled with S.S. Jewellers details:
- Email: `shivamanand1992@gmail.com`
- Password: `Today@123`

Click Register (or modify details as needed).

## Deployment to Railway

### Step 1: Prepare for Production

Build the frontend:
```bash
npm run build
```

Update `.env` for production (use your actual PostgreSQL URL from Railway).

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL plugin
4. Deploy code (connect GitHub or manual upload)

### Step 3: Configure Environment Variables on Railway

In Railway dashboard, set:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret
NODE_ENV=production
```

### Step 4: Deploy

Railway will auto-deploy when you push to GitHub or upload your code.

## Usage

### Creating an Invoice

1. Go to **Dashboard** → **Create New Invoice**
2. Enter customer details (name, state, address, GSTIN if they have one)
3. Input today's **Gold Price** and **Silver Price**
4. Add items:
   - Select item type (Gold Ring, Silver Pendant, etc.)
   - Enter weight (grams) and purity (22K, 20K, 18K, 925)
   - Add gemstone price if any
   - Add making charge
5. System auto-calculates GST:
   - 3% on jewellery (gold/silver + gemstone)
   - 5% on making charge
6. Click **Create Invoice**

### Viewing & Downloading

- Go to **Dashboard** to see all invoices
- Click **View** to see invoice details
- Click **Download PDF** to save as PDF

### GST Filing

The dashboard shows a **GST Summary** table with monthly breakdown:
- GST @ 3% (Gold/Silver)
- GST @ 5% (Making Charge)
- Total Taxable Amount

Use this to file your GST returns with your CA.

## File Structure

```
jewellery-invoicing/
├── server.js                 # Backend entry point
├── src/
│   ├── App.js               # React main component
│   ├── App.css              # Styling
│   ├── index.js             # React entry
│   └── pages/
│       ├── Login.js
│       ├── Register.js
│       ├── Dashboard.js
│       ├── CreateInvoice.js
│       └── ViewInvoice.js
├── public/
│   └── index.html
├── webpack.config.js        # Bundler config
├── package.json
└── .env                      # Environment variables
```

## API Endpoints

- `POST /api/register` – Register new shop
- `POST /api/login` – Login
- `GET /api/user` – Get user details
- `POST /api/invoices` – Create invoice
- `GET /api/invoices` – List all invoices
- `GET /api/invoices/:id` – Get invoice details
- `GET /api/invoices/:id/pdf` – Download PDF
- `GET /api/gst-summary` – GST summary by month

All endpoints require JWT token in Authorization header.

## Troubleshooting

**Database connection error:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env is correct

**Port already in use:**
- Change PORT in .env or run on different port

**PDF download not working:**
- Check CORS is enabled in server.js
- Ensure pdfkit library is installed

**QR code not showing:**
- Verify UPI ID is set during registration
- Check browser console for errors

## Future Enhancements

- WhatsApp integration for voice invoices
- AI-powered item suggestions
- Inventory tracking
- Payment gateway integration
- Bulk invoice download for CA
- Multi-shop management
- Mobile app

## Support

For issues or questions, contact Shivam at shivamanand1992@gmail.com

---

**Note:** This system is built for Indian tax compliance. GST rates and rules are as of 2026. Verify current rates with your CA before using for official filing.
