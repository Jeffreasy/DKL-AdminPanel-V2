import apiClient from '../api/axios.client';
import { DashboardData } from '../api/types/dashboard.types';

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const { data } = await apiClient.get<DashboardData>('/admin/dashboard');
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  },
};