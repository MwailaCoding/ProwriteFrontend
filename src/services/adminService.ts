import api from '../config/api';
import { User, MarketData } from '../types';

class AdminService {
  async getUsers(): Promise<User[]> {
    const response = await api.get('/admin/users');
    return response.data;
  }

  async updateMarketData(data: MarketData[]): Promise<{ message: string }> {
    const response = await api.post('/admin/market-data', data);
    return response.data;
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    premiumUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  }> {
    const users = await this.getUsers();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return {
      totalUsers: users.length,
      premiumUsers: users.filter(u => u.isPremium).length,
      activeUsers: users.filter(u => {
        if (!u.lastLogin) return false;
        const lastLogin = new Date(u.lastLogin);
        const daysSince = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      }).length,
      newUsersThisMonth: users.filter(u => {
        if (!u.createdAt) return false;
        const created = new Date(u.createdAt);
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
      }).length
    };
  }
}

export const adminService = new AdminService();