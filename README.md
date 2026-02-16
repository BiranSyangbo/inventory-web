# Stock Management Application

A modern, full-stack inventory management system built with React + Vite frontend and Express.js backend. Features JWT authentication, real-time stock tracking, and comprehensive dashboard with 5 different chart visualizations.

## Features

### Authentication
- JWT-based login and registration system
- Secure password hashing with bcryptjs
- Token-based protected API routes
- Pre-loaded demo credentials for testing

### Dashboard
- **Current Stock Levels**: Bar chart showing inventory quantities by product
- **Stock Movement Trends**: Line chart tracking inventory changes over 30 days
- **Category Breakdown**: Pie chart showing stock distribution across categories
- **Low Stock Alerts**: Real-time alerts for items below reorder levels
- **Inventory Value Analysis**: Bar chart showing inventory value by category

### Summary Cards
- Total number of items in stock
- Total inventory value in dollars
- Count of low-stock items
- Number of product categories

## Project Structure

```
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints (login, register)
│   │   └── stocks.js            # Stock data endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   └── data/
│       └── stocks.js            # Sample stock data
├── src/
│   ├── App.jsx                  # Main app component with auth context
│   ├── pages/
│   │   ├── LoginPage.jsx        # Login/register page
│   │   └── DashboardPage.jsx    # Main dashboard with all charts
│   ├── components/
│   │   ├── InventoryChart.jsx   # Bar chart for current stock
│   │   ├── TrendsChart.jsx      # Line chart for stock trends
│   │   ├── CategoryChart.jsx    # Pie chart for categories
│   │   ├── LowStockAlerts.jsx   # Alerts table
│   │   └── ValueChart.jsx       # Bar chart for inventory value
│   └── App.css, index.css       # Styling with Tailwind
├── .env                         # Environment variables
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── vite.config.js              # Vite configuration
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

This will install both frontend and backend dependencies.

### 2. Backend Setup

The backend uses Express.js with sample data stored in memory. No database setup required.

**Configure Environment Variables** (optional):
Edit `.env` file to customize:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Application

You need to run both backend and frontend servers:

#### Terminal 1 - Start Backend Server
```bash
npm run dev:backend
```
Backend will run on `http://localhost:5000`

#### Terminal 2 - Start Frontend (Vite Dev Server)
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Demo Credentials

Use these credentials to test the application:

**Demo User:**
- Email: `demo@example.com`
- Password: `password123`

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

Or register a new account on the registration form.

## API Endpoints

### Authentication Routes (No token required)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Stock Routes (Token required)
- `GET /api/stocks/inventory` - Get current inventory levels
- `GET /api/stocks/history` - Get 30-day stock movement history
- `GET /api/stocks/categories` - Get category breakdown
- `GET /api/stocks/alerts` - Get low stock alerts
- `GET /api/stocks/value` - Get inventory value analysis
- `GET /api/stocks/summary` - Get dashboard summary

All stock endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Technology Stack

### Frontend
- **React 19.2** - UI library
- **Vite 7.3** - Build tool and dev server
- **Tailwind CSS 3.3** - Utility-first styling
- **Recharts 2.10** - Chart library
- **Axios 1.6** - HTTP client

### Backend
- **Express.js 4.18** - Web framework
- **JWT 9.1** - Authentication
- **bcryptjs 2.4** - Password hashing
- **CORS 2.8** - Cross-origin requests
- **dotenv 16.3** - Environment variables

## Development

### Build for Production

Frontend:
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Sample Data

The application comes with sample data for 10 products across 4 categories:
- **Spirits**: Vodka, Whiskey, Rum, Tequila, Gin
- **Wine**: Red Bordeaux, White Sauvignon, Champagne
- **Beer**: IPA, Lager

Each product has:
- Current quantity in stock
- Unit price
- Reorder level (for low stock alerts)

Stock history tracks inventory changes over 30 days for trend analysis.

## Notes

- All data is stored in memory and resets when the server restarts
- For production use, integrate with a real database (MongoDB, PostgreSQL, etc.)
- Change the `JWT_SECRET` environment variable in production
- CORS is configured to allow requests from the frontend URL
- The application includes pre-seeded demo accounts for testing

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User roles and permissions
- Product management interface
- Stock movement history with dates
- Export reports functionality
- Real-time notifications
- Multi-warehouse support
- Barcode scanning
