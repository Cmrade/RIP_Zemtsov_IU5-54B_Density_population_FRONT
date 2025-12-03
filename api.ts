import { Population } from '../types';
import { MOCK_ORDERS } from './mockData';

// Определяем базовый URL в зависимости от окружения
const getApiBaseUrl = (): string => {
  // Если в режиме разработки, используем относительный путь (прокси)
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  
  // В production используем переменную окружения или мок
  return process.env.REACT_APP_API_URL || '';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async fetchWithFallback<T>(url: string, mockData: T): Promise<T> {
    // Если в production и нет API_URL, сразу используем мок
    if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
      console.log('Production mode without API, using mock data');
      return mockData;
    }
    
    try {
      console.log(`Fetching from: ${API_BASE_URL}${url}`);
      const response = await fetch(`${API_BASE_URL}${url}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`API request failed, using mock data: ${error}`);
      return mockData;
    }
  }

  // ... остальной код без изменений

  async getPopulations(): Promise<Population[]> {
    return this.fetchWithFallback('/populations/', MOCK_ORDERS);
  }

  async getPopulationById(id: number): Promise<Population> {
    const mockPopulation = MOCK_ORDERS.find(population => population.id === id) || MOCK_ORDERS[0];
    return this.fetchWithFallback(`/populations/${id}/`, mockPopulation);
  }

  async searchPopulations(title: string): Promise<Population[]> {
    const filteredMock = MOCK_ORDERS.filter(population => 
      population.title.toLowerCase().includes(title.toLowerCase())
    );
    return this.fetchWithFallback(`/populations/?title=${encodeURIComponent(title)}`, filteredMock);
  }
}

export const apiService = new ApiService();