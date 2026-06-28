import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getCategoryIcon } from '../Dashboard/Dashboard';
import './Transactions.css';

const CATEGORIES = {
  income: ['salary', 'investments', 'freelance', 'others'],
  expense: ['food', 'travel', 'shopping', 'health', 'bills', 'others']
};

function Transactions() {
  const { API_URL } = useAuth();
  const { showToast } = useToast();

  // Transaction List state
  const [transactions, setTransactions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters, search & sorting state
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    sortBy: 'newest'
  });

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringInterval: 'none'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch transactions function (wrapped in useCallback to prevent infinite render loops)
  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      const { type, category, search, sortBy } = filters;
      const response = await axios.get(`${API_URL}/api/transactions`, {
        params: {
          page,
          limit: 8,
          type: type || undefined,
          category: category || undefined,
          search: search || undefined,
          sortBy
        }
      });
      
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotalCount(response.data.total);
    } catch (error) {
      console.error('Error loading transactions:', error);
      showToast('Error loading transactions', 'error');
    }
  }, [filters, API_URL, showToast]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  // Handle transaction deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await axios.delete(`${API_URL}/api/transactions/${id}`);
      showToast('Transaction deleted successfully', 'success');
      // Reload current page (or previous page if current page becomes empty)
      const isLastItemOnPage = transactions.length === 1;
      const targetPage = isLastItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;
      fetchTransactions(targetPage);
    } catch (error) {
      showToast('Failed to delete transaction', 'error');
    }
  };

  // Handle Form field change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'type') {
      // Automatically reset category when switching between income and expense
      setFormData({
        ...formData,
        type: value,
        category: CATEGORIES[value][0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle Form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/transactions`, {
        ...formData,
        recurringInterval: formData.isRecurring ? formData.recurringInterval : 'none'
      });
      
      showToast('Transaction added successfully!', 'success');
      // Clear form except type and date defaults
      setFormData({
        amount: '',
        type: formData.type,
        category: CATEGORIES[formData.type][0],
        description: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        recurringInterval: 'none'
      });
      fetchTransactions(1);
    } catch (error) {
      const msg = error.response?.data?.message || 'Error creating transaction';
      showToast(msg, 'error');
    }
    setIsSubmitting(false);
  };

  // Export report as CSV file
  const handleExportCSV = async () => {
    try {
      // Fetch all transactions without limit to export everything
      const response = await axios.get(`${API_URL}/api/transactions`, {
        params: { limit: 1000 }
      });
      
      const allData = response.data.transactions;
      if (allData.length === 0) {
        return showToast('No transactions to export.', 'warning');
      }

      // Generate CSV string
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (INR)', 'Recurring', 'Interval'];
      const csvRows = [headers.join(',')];

      allData.forEach(t => {
        const row = [
          new Date(t.date).toLocaleDateString('en-IN'),
          t.type.toUpperCase(),
          `"${t.category}"`,
          `"${t.description.replace(/"/g, '""')}"`,
          t.amount,
          t.isRecurring ? 'YES' : 'NO',
          t.recurringInterval || 'none'
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Pennywise_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV report exported successfully!', 'success');
    } catch (error) {
      showToast('Failed to export CSV report', 'error');
    }
  };

  return (
    <main className="pw-main">
      <div className="list-panel-header">
        <div>
          <h1 className="gradient-title" style={{ fontSize: '28px' }}>Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Add and manage your income/expense logs</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary" style={{ display: 'inline-flex', gap: '8px', fontSize: '14px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export CSV
        </button>
      </div>

      <div className="transactions-layout">
        {/* Left Panel: Form */}
        <div className="transaction-form-panel">
          <h3>Add Transaction</h3>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="tx-type">Type</label>
              <select
                id="tx-type"
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="filter-select"
                style={{ width: '100%' }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-category">Category</label>
              <select
                id="tx-category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="filter-select"
                style={{ width: '100%' }}
              >
                {CATEGORIES[formData.type].map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label" htmlFor="tx-amount">Amount (₹)</label>
                <input
                  id="tx-amount"
                  type="number"
                  name="amount"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tx-date">Date</label>
                <input
                  id="tx-date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-desc">Description</label>
              <input
                id="tx-desc"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="form-input"
                placeholder="Where did you spend?"
                required
              />
            </div>

            <div className="form-checkbox-row" onClick={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}>
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleFormChange}
              />
              <span className="form-label" style={{ margin: 0, userSelect: 'none' }}>Recurring Transaction</span>
            </div>

            {formData.isRecurring && (
              <div className="form-group" style={{ animation: 'slide-in 0.2s forwards' }}>
                <label className="form-label" htmlFor="tx-interval">Interval</label>
                <select
                  id="tx-interval"
                  name="recurringInterval"
                  value={formData.recurringInterval}
                  onChange={handleFormChange}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="none">Select Interval</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </form>
        </div>

        {/* Right Panel: List */}
        <div className="transaction-list-panel">
          {/* Filters Area */}
          <div className="filter-bar-glass">
            <div className="search-input-wrapper">
              <span className="search-icon-svg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search description..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="form-input"
              />
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, category: '' }))}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {filters.type ? (
                CATEGORIES[filters.type].map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))
              ) : (
                [...CATEGORIES.income, ...CATEGORIES.expense].map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))
              )}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          {/* Transactions List */}
          {transactions.length > 0 ? (
            <div className="items-list-wrapper">
              {transactions.map(t => (
                <div key={t._id} className="transaction-list-item">
                  <div className="item-left-desc">
                    <div className={`item-badge-icon ${t.type}`}>
                      {getCategoryIcon(t.category, t.type)}
                    </div>
                    <div className="item-primary-info">
                      <span className="item-title-text">{t.description}</span>
                      <div className="item-meta-row">
                        <span style={{ textTransform: 'capitalize' }}>{t.category}</span>
                        {t.isRecurring && (
                          <span className="badge-tag-recurring">{t.recurringInterval}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="item-right-actions">
                    <div className="amount-display-col">
                      <span className={`amount-text-val ${t.type}`}>
                        {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="date-text-val">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <button onClick={() => handleDelete(t._id)} className="btn-icon-delete" title="Delete record">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pagination-controls-bar">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => fetchTransactions(currentPage - 1)}
                    className="btn-page-nav"
                  >
                    Previous
                  </button>
                  <span className="page-indicator">Page {currentPage} of {totalPages} ({totalCount} total)</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => fetchTransactions(currentPage + 1)}
                    className="btn-page-nav"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="no-data-placeholder" style={{ padding: '60px 0' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span style={{ marginTop: '12px' }}>No records match your filters. Try adjusting them or add a new transaction.</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Transactions;