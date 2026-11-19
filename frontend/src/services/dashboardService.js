import api from './api';

export const dashboardService = {
  async getSummary() {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  async getLowStock() {
    const res = await api.get('/dashboard/low-stock');
    return res.data;
  },
};

export default dashboardService;
