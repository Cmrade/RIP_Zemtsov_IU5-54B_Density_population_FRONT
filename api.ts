import { Population } from '../types';
import { MOCK_ORDERS } from './mockData';
import axiosInstance, { MEDIA_BASE_URL } from './axiosInstance';

class ApiService {
  async getPopulations(): Promise<Population[]> {
    try {
      console.log('🔄 Fetching populations from API...');
      
      const response = await axiosInstance.get('/orders/');
      const data = response.data;
      
      console.log('🎉 API Response:', data);
      
      const transformedData = data.map((population: Population) => ({
        ...population,
        image: this.fixImageUrl(population.image),
      }));
      
      console.log('✅ Transformed data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('❌ API Error Details:', error);
      throw error;
    }
  }

  async getPopulationById(id: number): Promise<Population> {
    try {
      const response = await axiosInstance.get(`/orders/${id}/`);
      const data = response.data;
      return {
        ...data,
        image: this.fixImageUrl(data.image),
      };
    } catch (error) {
      console.warn('Using mock data due to API error:', error);
      const mockPopulation = MOCK_ORDERS.find((p: Population) => p.id === id) || MOCK_ORDERS[0];
      return mockPopulation;
    }
  }

  async searchPopulations(title: string): Promise<Population[]> {
    try {
      const response = await axiosInstance.get(`/orders/?title=${encodeURIComponent(title)}`);
      const data = response.data;
      return data.map((population: Population) => ({
        ...population,
        image: this.fixImageUrl(population.image),
      }));
    } catch (error) {
      console.warn('Using mock data due to API error:', error);
      return MOCK_ORDERS.filter((population: Population) => 
        population.title.toLowerCase().includes(title.toLowerCase())
      );
    }
  }

  private fixImageUrl(imagePath: string | null): string {
    if (!imagePath) return '/default-image.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/media/')) {
      return `${MEDIA_BASE_URL}${imagePath.substring(6)}`;
    }
    
    if (imagePath.startsWith('media/')) {
      return `${MEDIA_BASE_URL}/${imagePath}`;
    }
    
    return '/default-image.jpg';
  }

  // Методы для работы с заявками
  async getApplications(): Promise<any[]> {
    try {
      const response = await axiosInstance.get('/applications/');
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  async getApplicationById(id: number): Promise<any> {
    try {
      const response = await axiosInstance.get(`/applications/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      return null;
    }
  }

  async addOrderToApplication(applicationId: number, orderId: number, comment?: string): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `/applications/${applicationId}/orders/`,
        { order_id: orderId, comment }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error adding order to application:', error);
      throw new Error(error.response?.data?.error || 'Ошибка добавления услуги');
    }
  }

  async formApplication(id: number, territory_area: number): Promise<any> {
    try {
      const response = await axiosInstance.put(
        `/applications/${id}/form/`,
        { territory_area }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error forming application:', error);
      throw new Error(error.response?.data?.error || 'Ошибка формирования заявки');
    }
  }

  async removeOrderFromApplication(applicationId: number, orderId: number): Promise<any> {
    try {
      const response = await axiosInstance.delete(`/applications/${applicationId}/orders/${orderId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing order from application:', error);
      throw new Error(error.response?.data?.error || 'Ошибка удаления услуги');
    }
  }

  async getCart(): Promise<any> {
    try {
      const response = await axiosInstance.get('/cart/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      // Если корзины нет, создаем новую
      if (error.response?.status === 404) {
        return { id: 0, orders: [], orders_count: 0 };
      }
      throw new Error('Ошибка загрузки корзины');
    }
  }
}

export const apiService = new ApiService();