import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Transactions from './components/Transactions/Transactions';
import Analytics from './components/Analytics/Analytics';
import Goals from './components/Goals/Goals';
import './index.css';

// Guard for protected routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0a0a' }}>
        <div className="loading" style={{ color: '#c8ff00', fontSize: '20px', fontWeight: 600 }}>Loading Pennywise...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

// Wrapper for layouts that require sidebar navbar
function AppLayout({ children }) {
  const location = useLocation();
  const showRightSidebar = location.pathname === '/';
  
  return (
    <div className="pw-root">
      <div className="pw-grid-bg"></div>
      <div className="pw-watermark">₹</div>
      <Navbar />
      <div className={`pw-body ${showRightSidebar ? 'has-right-sidebar' : ''}`}>
        <Sidebar />
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="ambient-background">
          <div className="ambient-blob blob-1"></div>
          <div className="ambient-blob blob-2"></div>
          <div className="ambient-blob blob-3"></div>
          <div className="ambient-blob blob-4"></div>
          <div className="grid-overlay"></div>
        </div>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute>
                <AppLayout>
                  <Transactions />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/goals" element={
              <ProtectedRoute>
                <AppLayout>
                  <Goals />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;