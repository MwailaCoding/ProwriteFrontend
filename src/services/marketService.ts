import api from '../config/api';
import { MarketData } from '../types';

class MarketService {
  async getMarketData(region?: string, industry?: string): Promise<MarketData[]> {
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (industry) params.append('industry', industry);
    
    const response = await api.get(`/market-data?${params.toString()}`);
    return response.data;
  }

  async analyzeJobDescription(description: string, url?: string): Promise<{ keywords: string }> {
    const response = await api.post('/job-descriptions/analyze', {
      description,
      url
    });
    return response.data;
  }

  async getTopSkills(region: string = 'Nairobi'): Promise<MarketData[]> {
    const data = await this.getMarketData(region);
    return data.sort((a, b) => b.demand_percentage - a.demand_percentage).slice(0, 10);
  }

  async getTrendingSkills(region: string = 'Nairobi'): Promise<MarketData[]> {
    const data = await this.getMarketData(region);
    return data.filter(item => item.trend === 'up');
  }
}

export const marketService = new MarketService();