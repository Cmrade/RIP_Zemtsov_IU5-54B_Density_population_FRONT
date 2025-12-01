import { Population } from '../types';
import { MOCK_ORDERS } from './mockData';

const API_BASE_URL = 'http://localhost:8000/api'; // URL вашего Django API

class ApiService {
  private async fetchWithFallback<T>(url: string, mockData: T): Promise<T> {
    try {
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

  async addToCart(populationId: number, comment?: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/cart/populations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          population_id: populationId,
          comment: comment || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`Add to cart failed: ${error}`);
      // Можно добалить mock-ответ для корзины если нужно
      return { success: false, error: 'Failed to add to cart' };
    }
  }
}

export const apiService = new ApiService();