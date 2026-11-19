import api from './api';

export const authService = {
  async signup(data) {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  logout() {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('stockflow_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('stockflow_token');
  },
};

export default authService;
