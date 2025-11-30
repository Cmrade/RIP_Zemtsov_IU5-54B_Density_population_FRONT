import { Order } from '../types';
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

  async getOrders(): Promise<Order[]> {
    return this.fetchWithFallback('/orders/', MOCK_ORDERS);
  }

  async getOrderById(id: number): Promise<Order> {
    const mockOrder = MOCK_ORDERS.find(order => order.id === id) || MOCK_ORDERS[0];
    return this.fetchWithFallback(`/orders/${id}/`, mockOrder);
  }

  async searchOrders(title: string): Promise<Order[]> {
    const filteredMock = MOCK_ORDERS.filter(order => 
      order.title.toLowerCase().includes(title.toLowerCase())
    );
    return this.fetchWithFallback(`/orders/?title=${encodeURIComponent(title)}`, filteredMock);
  }

  async addToCart(orderId: number, comment?: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/cart/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
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