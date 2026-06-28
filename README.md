# Pennywise 🪙 | Premium Personal Finance Tracker

Pennywise is a full-stack, industry-grade Personal Finance Tracker featuring a dark Glassmorphism dashboard interface. It is built using the MERN Stack (MongoDB, Express, React, Node.js) with deep visual analytics, dynamic category budgets, long-term savings goals tracking, and automated spending insights.

---

## 🚀 Key Portfolio Features

### 🔒 Authentication & Security
*   **Token-Based Session Management:** Stateless login/signup utilizing secure JSON Web Tokens (JWT).
*   **Password Hashing:** Robust password storage with `bcryptjs` using a salt work factor of 12.
*   **Route Protection:** React Router navigation guards that shield all financial dashboard routes.

### 💰 Core Functionalities (MERN Stack)
*   **Comprehensive Cash Flow Overview:** Visual cards display Monthly Income, Expenses, Savings, and Savings Rate.
*   **Flexible Dynamic Budgets:** Database-stored custom spending limits per category, complete with reactive colored progress indicator bars (Green/Amber/Red) and warnings.
*   **Full Savings Goals Tracker:** Set targets and deadlines for long-term purchases (e.g. laptop, travel) and record progressive savings contributions.
*   **Search, Filter, & Sort:** Sort logs by Newest, Oldest, Highest Amount, or Lowest Amount. Search descriptions instantly.
*   **CSV Report Exports:** Download all transaction logs in standard CSV format for off-line auditing.

### 📊 Advanced Analytics
*   **Cash Flow Charting:** Beautiful responsive 6-month historical trend charts comparing income vs expenses.
*   **Category Share Breakdown:** Doughnut chart mapping expenses across categories (Food, Travel, Bills, etc.) alongside color-coded metric tables.
*   **Smart Spending Insights:** Automated comparative analysis comparing consecutive months (e.g., *"You spent 15% more on Travel this month."*).

---

## 🛠️ Tech Stack & Architecture

*   **Frontend:** React (Vite/Create React App), Chart.js, React-Chartjs-2, Vanilla CSS.
*   **Backend:** Node.js, Express, Mongoose ODM.
*   **Database:** MongoDB Atlas.
*   **Deployment:** Frontend hosted on **Vercel**; Backend hosted on **Render**.

---

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas Cluster)

### 1. Install Dependencies
Run in both the frontend and backend folders:
```bash
# Setup backend
cd backend
npm install

# Setup frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` folder:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_signing_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run Locally
Start the development servers:
```bash
# Start backend (from backend/)
npm run dev

# Start frontend (from frontend/)
npm run start
```
*   Frontend: `http://localhost:3000`
*   Backend: `http://localhost:5001`
