import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('stockflow_token');
    const savedUser = localStorage.getItem('stockflow_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('stockflow_token');
        localStorage.removeItem('stockflow_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const userData = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      defaultLowStockThreshold: data.defaultLowStockThreshold,
    };
    localStorage.setItem('stockflow_token', data.token);
    localStorage.setItem('stockflow_user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    return data;
  };

  const signup = async (credentials) => {
    const data = await authService.signup(credentials);
    const userData = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      defaultLowStockThreshold: data.defaultLowStockThreshold,
    };
    localStorage.setItem('stockflow_token', data.token);
    localStorage.setItem('stockflow_user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateOrgThreshold = (threshold) => {
    if (user) {
      const updated = { ...user, defaultLowStockThreshold: threshold };
      setUser(updated);
      localStorage.setItem('stockflow_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        signup,
        logout,
        updateOrgThreshold,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
