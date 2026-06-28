import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Session restore failed:', error);
      logout();
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      showToast(`Welcome back, ${user.name}!`, 'success');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      showToast('Registration successful! Welcome to Pennywise.', 'success');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Email might be taken.';
      showToast(msg, 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    showToast('Logged out successfully.', 'success');
  };

  const updateBudget = async (budgetAmount) => {
    try {
      const response = await axios.put(`${API_URL}/api/auth/budget`, { budget: budgetAmount });
      setUser(prev => ({ ...prev, monthlyBudget: response.data.monthlyBudget }));
      showToast(
        budgetAmount === null 
          ? 'Monthly budget goal cleared.' 
          : `Monthly budget set to ₹${budgetAmount.toLocaleString('en-IN')}`, 
        'success'
      );
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update budget goal.';
      showToast(msg, 'error');
      return false;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateBudget,
    loading,
    API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}