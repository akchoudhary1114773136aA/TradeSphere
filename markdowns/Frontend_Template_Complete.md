# STOCKLY Frontend Template - User Management System
## Copy-paste ready React components for your team

---

## Project Structure

```
frontend/src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ProtectedRoute.jsx
│   ├── Layout/
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   └── Dashboard/
│       ├── Holdings.jsx
│       └── Transactions.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── HoldingsPage.jsx
│   └── TransactionsPage.jsx
├── context/
│   └── AuthContext.jsx
├── api/
│   └── client.js
├── App.jsx
├── App.css
└── index.js
```

---

## Step 1: .env file (Frontend)

```
REACT_APP_API_URL=http://localhost:3002/api
```

---

## Step 2: api/client.js (API Configuration)

```javascript
// src/api/client.js
const API_URL = process.env.REACT_APP_API_URL;

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Fetch wrapper with authentication
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'API Error');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  register: (email, password, fullName) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    }),

  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => apiCall('/auth/me'),
};

// Holdings API calls
export const holdingsAPI = {
  create: (data) =>
    apiCall('/holdings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () => apiCall('/holdings'),

  getById: (id) => apiCall(`/holdings/${id}`),

  update: (id, data) =>
    apiCall(`/holdings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiCall(`/holdings/${id}`, {
      method: 'DELETE',
    }),
};

// Transactions API calls
export const transactionsAPI = {
  create: (data) =>
    apiCall('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/transactions?${params.toString()}`);
  },

  getById: (id) => apiCall(`/transactions/${id}`),

  update: (id, data) =>
    apiCall(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiCall(`/transactions/${id}`, {
      method: 'DELETE',
    }),
};
```

---

## Step 3: context/AuthContext.jsx

```javascript
// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const data = await authAPI.getMe();
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName) => {
    try {
      setError(null);
      const data = await authAPI.register(email, password, fullName);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authAPI.login(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Step 4: components/Auth/ProtectedRoute.jsx

```javascript
// src/components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

---

## Step 5: components/Layout/Header.jsx

```javascript
// src/components/Layout/Header.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <h1 style={{ margin: 0 }}>STOCKLY</h1>
      {user && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};
```

---

## Step 6: components/Layout/Sidebar.jsx

```javascript
// src/components/Layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/holdings', label: 'Holdings' },
    { path: '/transactions', label: 'Transactions' },
  ];

  return (
    <aside
      style={{
        backgroundColor: '#f1f5f9',
        padding: '1.5rem',
        width: '200px',
        minHeight: '100vh',
        borderRight: '1px solid #e2e8f0',
      }}
    >
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {navItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '0.5rem' }}>
              <Link
                to={item.path}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: isActive(item.path) ? '#2563eb' : '#333',
                  backgroundColor: isActive(item.path)
                    ? '#dbeafe'
                    : 'transparent',
                  borderRadius: '0.25rem',
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
```

---

## Step 7: components/Auth/Login.jsx

```javascript
// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        STOCKLY Login
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don't have an account?{' '}
        <Link
          to="/register"
          style={{ color: '#2563eb', textDecoration: 'none' }}
        >
          Register here
        </Link>
      </p>
    </div>
  );
};
```

---

## Step 8: components/Auth/Register.jsx

```javascript
// src/components/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        Create Account
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already have an account?{' '}
        <Link
          to="/login"
          style={{ color: '#2563eb', textDecoration: 'none' }}
        >
          Login here
        </Link>
      </p>
    </div>
  );
};
```

---

## Step 9: components/Dashboard/Holdings.jsx

```javascript
// src/components/Dashboard/Holdings.jsx
import React, { useState, useEffect } from 'react';
import { holdingsAPI } from '../../api/client';

export const Holdings = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stockSymbol: '',
    companyName: '',
    quantity: '',
    averagePrice: '',
  });

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      const data = await holdingsAPI.getAll();
      setHoldings(data.holdings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddHolding = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await holdingsAPI.create({
        ...formData,
        quantity: parseInt(formData.quantity),
        averagePrice: parseFloat(formData.averagePrice),
      });
      setFormData({
        stockSymbol: '',
        companyName: '',
        quantity: '',
        averagePrice: '',
      });
      setShowForm(false);
      fetchHoldings();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHolding = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await holdingsAPI.delete(id);
        fetchHoldings();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Holdings</h2>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          + Add Holding
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleAddHolding}
          style={{
            backgroundColor: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Stock Symbol
              </label>
              <input
                type="text"
                name="stockSymbol"
                value={formData.stockSymbol}
                onChange={handleInputChange}
                placeholder="AAPL"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Apple Inc"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="100"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Average Price
              </label>
              <input
                type="number"
                name="averagePrice"
                value={formData.averagePrice}
                onChange={handleInputChange}
                placeholder="150.50"
                step="0.01"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              Add Holding
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading holdings...</p>
      ) : holdings.length === 0 ? (
        <p>No holdings yet. Add one to get started!</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #e5e7eb',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'left',
                }}
              >
                Symbol
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'left',
                }}
              >
                Company
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'right',
                }}
              >
                Quantity
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'right',
                }}
              >
                Avg Price
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'right',
                }}
              >
                Total Value
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'center',
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={holding._id}>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {holding.stockSymbol}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                  }}
                >
                  {holding.companyName}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'right',
                  }}
                >
                  {holding.quantity}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'right',
                  }}
                >
                  ₹{holding.averagePrice.toFixed(2)}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'right',
                  }}
                >
                  ₹{holding.totalValue.toFixed(2)}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'center',
                  }}
                >
                  <button
                    onClick={() => handleDeleteHolding(holding._id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

---

## Step 10: components/Dashboard/Transactions.jsx

```javascript
// src/components/Dashboard/Transactions.jsx
import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../../api/client';

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stockSymbol: '',
    companyName: '',
    transactionType: 'buy',
    quantity: '',
    pricePerUnit: '',
    commission: '0',
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsAPI.getAll();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await transactionsAPI.create({
        ...formData,
        quantity: parseInt(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        commission: parseFloat(formData.commission) || 0,
      });
      setFormData({
        stockSymbol: '',
        companyName: '',
        transactionType: 'buy',
        quantity: '',
        pricePerUnit: '',
        commission: '0',
      });
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await transactionsAPI.delete(id);
        fetchTransactions();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Transactions</h2>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          + Add Transaction
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleAddTransaction}
          style={{
            backgroundColor: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Stock Symbol
              </label>
              <input
                type="text"
                name="stockSymbol"
                value={formData.stockSymbol}
                onChange={handleInputChange}
                placeholder="AAPL"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Type
              </label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="100"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Price Per Unit
              </label>
              <input
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleInputChange}
                placeholder="150.50"
                step="0.01"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Commission
              </label>
              <input
                type="number"
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              Add Transaction
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #e5e7eb',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'left',
                }}
              >
                Date
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'left',
                }}
              >
                Symbol
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'center',
                }}
              >
                Type
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'right',
                }}
              >
                Quantity
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'right',
                }}
              >
                Price
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'right',
                }}
              >
                Total
              </th>
              <th
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'center',
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                  }}
                >
                  {new Date(transaction.transactionDate).toLocaleDateString()}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {transaction.stockSymbol}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'center',
                    color:
                      transaction.transactionType === 'buy'
                        ? '#0369a1'
                        : '#dc2626',
                  }}
                >
                  {transaction.transactionType.toUpperCase()}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'right',
                  }}
                >
                  {transaction.quantity}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'right',
                  }}
                >
                  ₹{transaction.pricePerUnit.toFixed(2)}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'right',
                  }}
                >
                  ₹{transaction.totalAmount.toFixed(2)}
                </td>
                <td
                  style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'center',
                  }}
                >
                  <button
                    onClick={() => handleDeleteTransaction(transaction._id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

---

## Step 11: App.jsx (Main App Router)

```javascript
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Holdings } from './components/Dashboard/Holdings';
import { Transactions } from './components/Dashboard/Transactions';

// Main Layout
const DashboardLayout = ({ children }) => {
  return (
    <div>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div style={{ padding: '2rem' }}>
                    <h1>Welcome to STOCKLY</h1>
                    <p>Use the sidebar to navigate</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/holdings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Holdings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Transactions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

---

## Installation & Setup Instructions

### For Your Team

1. **Copy all files** into your React project `src/` folder following the folder structure

2. **Install dependencies** (if not already installed):
   ```bash
   npm install react-router-dom
   ```

3. **Create .env file** in frontend root:
   ```
   REACT_APP_API_URL=http://localhost:3002/api
   ```

4. **Start the app:**
   ```bash
   npm start
   ```

5. **Make sure backend is running** on http://localhost:3002

---

## What Each Component Does

| Component | Purpose |
|-----------|---------|
| `AuthContext.jsx` | Manages user authentication state globally |
| `Login.jsx` | Login form page |
| `Register.jsx` | Registration form page |
| `ProtectedRoute.jsx` | Protects routes (requires login) |
| `Header.jsx` | Top navigation with user info & logout |
| `Sidebar.jsx` | Side navigation menu |
| `Holdings.jsx` | Add/view/delete stocks you own |
| `Transactions.jsx` | Add/view/delete buy/sell transactions |
| `client.js` | All API calls & HTTP setup |
| `App.jsx` | Main router configuration |

---

## Simple Workflow

**User Login → Redirected to Dashboard → Can view Holdings & Transactions → Can add/delete items → Data saves to MongoDB**

That's it!
