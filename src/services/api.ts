// api.ts - исправленная версия
import { Population, DensityCalculation, MediaFile } from '../types';
import { MOCK_POPULATIONS } from './mockData';
import axiosInstance, { MEDIA_BASE_URL } from './axiosInstance';

class ApiService {
  // Методы для популяций (бывшие orders)
  async getPopulations(): Promise<Population[]> {
    try {
      console.log('🔄 Fetching populations from API...');
      const response = await axiosInstance.get('/populations/');
      const data = response.data;
      
      console.log('🎉 API Response:', data);
      
      const transformedData = data.map((population: Population) => ({
        ...population,
        image: this.fixMediaUrl(population.image),
        media_files: population.media_files 
          ? population.media_files.map((media: MediaFile) => this.fixMediaObjectUrl(media))
          : []
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
      const response = await axiosInstance.get(`/populations/${id}/`);
      const data = response.data;
      return {
        ...data,
        image: this.fixMediaUrl(data.image),
        media_files: data.media_files 
          ? data.media_files.map((media: MediaFile) => this.fixMediaObjectUrl(media))
          : []
      };
    } catch (error) {
      console.warn('Using mock data due to API error:', error);
      const mockPopulation = MOCK_POPULATIONS.find((p: Population) => p.id === id) || MOCK_POPULATIONS[0];
      return mockPopulation;
    }
  }

  async searchPopulations(title: string): Promise<Population[]> {
    try {
      const response = await axiosInstance.get(`/populations/?title=${encodeURIComponent(title)}`);
      const data = response.data;
      return data.map((population: Population) => ({
        ...population,
        image: this.fixMediaUrl(population.image),
        media_files: population.media_files 
          ? population.media_files.map((media: MediaFile) => this.fixMediaObjectUrl(media))
          : []
      }));
    } catch (error) {
      console.warn('Using mock data due to API error:', error);
      return MOCK_POPULATIONS.filter((population: Population) => 
        population.title.toLowerCase().includes(title.toLowerCase())
      );
    }
  }

  // Методы для медиа-файлов
  async getMediaByPopulationId(populationId: number): Promise<MediaFile[]> {
    try {
      const response = await axiosInstance.get(`/api/media/?population_id=${populationId}`);
      const data = response.data;
      return data.map((media: MediaFile) => this.fixMediaObjectUrl(media));
    } catch (error) {
      console.error('❌ Error fetching media files:', error);
      return [];
    }
  }

  async uploadMedia(populationId: number, file: File, fileType: 'image' | 'video'): Promise<MediaFile> {
    try {
      console.log(`📤 Uploading ${fileType} for population ${populationId}...`);
      
      const formData = new FormData();
      formData.append('population', populationId.toString());
      formData.append('file_type', fileType);
      
      // Проверяем, какой метод загрузки использовать
      if (fileType === 'image') {
        formData.append('image', file);
      } else {
        formData.append('video', file);
      }
      
      const response = await axiosInstance.post('/api/media/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const media = response.data;
      console.log('✅ Media uploaded successfully:', media);
      return this.fixMediaObjectUrl(media);
      
    } catch (error: any) {
      console.error('❌ Error uploading media file:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Ошибка загрузки медиа-файла'
      );
    }
  }

  async uploadMediaUrl(populationId: number, fileUrl: string, fileType: 'image' | 'video'): Promise<MediaFile> {
    try {
      console.log(`📤 Uploading media URL for population ${populationId}...`);
      
      const response = await axiosInstance.post('/api/media/', {
        population: populationId,
        file_url: fileUrl,
        file_type: fileType
      });
      
      const media = response.data;
      console.log('✅ Media URL uploaded successfully:', media);
      return this.fixMediaObjectUrl(media);
      
    } catch (error: any) {
      console.error('❌ Error uploading media URL:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Ошибка загрузки медиа-URL'
      );
    }
  }

  // Методы для расчетов плотности (бывшие applications)
  async getDensityCalculations(): Promise<DensityCalculation[]> {
    try {
      const response = await axiosInstance.get('/density_calculations/');
      return response.data;
    } catch (error) {
      console.error('Error fetching density calculations:', error);
      return [];
    }
  }

  async formDensityCalculation(id: number, territory_area: number): Promise<any> {
    try {
      const response = await axiosInstance.put(
        `/density_calculations/${id}/form/`,
        { territory_area }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error forming density calculation:', error);
      throw new Error(error.response?.data?.error || 'Ошибка формирования расчета плотности');
    }
  }

  async addPopulationToDensityCalculation(
    densityCalculationId: number, 
    populationId: number, 
    comment?: string
  ): Promise<any> {
    try {
      console.log(`🛒 Добавление населения ${populationId} в расчет ${densityCalculationId}`);
      
      const response = await axiosInstance.post(
        `/density_calculations/${densityCalculationId}/populations/`,
        { population_id: populationId, comment: comment || '' }
      );
      
      console.log('✅ Население успешно добавлено:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка добавления населения в расчет:', error);
      
      let errorMessage = 'Ошибка добавления типа населения в расчет плотности';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Специфические проверки статусов
      if (error.response?.status === 404) {
        errorMessage = `Расчет плотности с ID ${densityCalculationId} не найден`;
      } else if (error.response?.status === 403) {
        errorMessage = 'У вас нет доступа к этому расчету плотности';
      } else if (error.response?.status === 400) {
        if (errorMessage.includes('уже добавлен') || errorMessage.includes('уже в корзине')) {
          errorMessage = 'Этот тип населения уже добавлен в расчет';
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  async removePopulationFromDensityCalculation(densityCalculationId: number, populationId: number): Promise<any> {
    try {
      console.log(`🗑️ Removing population ${populationId} from density calculation ${densityCalculationId}`);
      
      const response = await axiosInstance.delete(
        `/density_calculations/${densityCalculationId}/populations/${populationId}/`
      );
      
      console.log('✅ Population removed successfully:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Error removing population from density calculation:', error);
      throw new Error(
        error.response?.data?.error || 
        'Ошибка удаления типа населения из расчета плотности'
      );
    }
  }
/*
  async getCart(): Promise<any> {
    try {
      console.log('🛒 Fetching cart...');
      const response = await axiosInstance.get('/cart/');
      console.log('✅ Cart data:', response.data);

      if (response.data.density_calculation_id) {
        const fullDensityCalculation = await this.getDensityCalculationById(response.data.density_calculation_id);
        return fullDensityCalculation;
      }
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Error fetching cart:', error);
      
      // Если корзина не найдена (404), пытаемся создать черновик
      if (error.response?.status === 404) {
        console.log('🔄 Корзина не найдена, пытаемся создать черновик...');
        try {
          const draftResult = await this.getOrCreateDraftCalculation();
          if (draftResult.density_calculation_id) {
            const fullDensityCalculation = await this.getDensityCalculationById(draftResult.density_calculation_id);
            return fullDensityCalculation;
          }
        } catch (draftError) {
          console.error('❌ Ошибка создания черновика:', draftError);
        }
      }
      
      // Возвращаем пустой черновик как запасной вариант
      return {
        id: 0,
        status: 'DRAFT',
        creation_datetime: new Date().toISOString(),
        populations: [],
        populations_count: 0
      };
    }
  }*/

  // Новый метод для получения или создания черновика расчета
  async getOrCreateDraftCalculation(): Promise<any> {
    try {
      console.log('🔄 Получение или создание черновика расчета...');
      const response = await axiosInstance.get('/api/density_calculations/get_or_create_draft/');
      console.log('✅ Черновик расчета получен:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Ошибка получения или создания черновика:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Ошибка получения или создания черновика расчета'
      );
    }
  }

  // ИСПРАВЛЕНО: теперь метод принимает string | null | undefined
  private fixMediaUrl(url: string | null | undefined): string {
    if (!url) return '/default-image.jpg';
    
    if (url.startsWith('http')) {
      return url;
    }
    
    if (url.startsWith('/media/')) {
      return `${MEDIA_BASE_URL}${url.substring(6)}`;
    }
    
    if (url.startsWith('media/')) {
      return `${MEDIA_BASE_URL}/${url}`;
    }
    
    return '/default-image.jpg';
  }

  private fixMediaObjectUrl(media: MediaFile): MediaFile {
    return {
      ...media,
      file_url: this.fixMediaUrl(media.file_url)
    };
  }

  // Новый метод для получения прямого URL медиа-файла
  getMediaDirectUrl(media: MediaFile): string {
    return this.fixMediaUrl(media.file_url);
  }

  // Метод для проверки типа медиа
  isVideoMedia(media: MediaFile): boolean {
    return media.file_type === 'video';
  }

  isImageMedia(media: MediaFile): boolean {
    return media.file_type === 'image';
  }

  async deleteMedia(mediaId: number): Promise<any> {
    try {
      console.log(`🗑️ Deleting media file ${mediaId}...`);
      const response = await axiosInstance.delete(`/api/media/${mediaId}/`);
      console.log('✅ Media deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting media file:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Ошибка удаления медиа-файла'
      );
    }
  }

  async deleteMediaByPopulation(populationId: number): Promise<any> {
    try {
      console.log(`🗑️ Deleting all media for population ${populationId}...`);
      const response = await axiosInstance.delete(`/api/media/${populationId}/delete_by_population/`);
      console.log('✅ Media deleted by population successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting media by population:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Ошибка удаления медиа-файлов для типа населения'
      );
    }
  }

  async bulkDeleteMedia(mediaIds: number[]): Promise<any> {
    try {
      console.log(`🗑️ Bulk deleting media files: ${mediaIds}...`);
      const response = await axiosInstance.delete('/api/media/bulk_delete/', {
        data: { media_ids: mediaIds }
      });
      console.log('✅ Media bulk deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error bulk deleting media:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Ошибка массового удаления медиа-файлов'
      );
    }
  }

  async getCart(): Promise<any> {
  try {
    console.log('🛒 Fetching cart...');
    const response = await axiosInstance.get('/cart/');
    console.log('✅ Cart data:', response.data);

    // Обрабатываем изображения для населения в корзине
    if (response.data.populations) {
      response.data.populations = response.data.populations.map((pop: any) => ({
        ...pop,
        population_image: this.fixMediaUrl(pop.population_image)
      }));
    }

    if (response.data.density_calculation_id) {
      const fullDensityCalculation = await this.getDensityCalculationById(response.data.density_calculation_id);
      
      // Также обрабатываем изображения в полном объекте расчета
      if (fullDensityCalculation.populations) {
        fullDensityCalculation.populations = fullDensityCalculation.populations.map((pop: any) => ({
          ...pop,
          population_image: this.fixMediaUrl(pop.population_image)
        }));
      }
      
      return fullDensityCalculation;
    }
    
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Error fetching cart:', error);
    return {
      id: 0,
      status: 'DRAFT',
      creation_datetime: new Date().toISOString(),
      populations: [],
      populations_count: 0
    };
  }
}

  async getDensityCalculationById(id: number): Promise<any> {
    try {
      console.log(`📋 Fetching density calculation ${id}...`);
      const response = await axiosInstance.get(`/density_calculations/${id}/`);
      console.log('✅ Density calculation data:', response.data);
      
      // Обрабатываем изображения для населения
      if (response.data.populations) {
        response.data.populations = response.data.populations.map((pop: any) => ({
          ...pop,
          population_image: this.fixMediaUrl(pop.population_image)
        }));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching density calculation:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();