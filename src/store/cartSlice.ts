import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api';
import axiosInstance from '../services/axiosInstance';

interface PopulationItem {
  id: number;
  population: number;
  population_title: string;
  population_image: string;
  comment: string;
  building_density?: number;
  people_per_building?: number;
}

interface DensityCalculation {
  id: number;
  status: string;
  creation_datetime: string;
  formation_datetime?: string;
  completion_datetime?: string;
  territory_area?: number;
  calculated_population?: number;
  client: number;
  client_username: string;
  manager?: number;
  manager_username?: string;
  populations: PopulationItem[];
  populations_count?: number;
}

interface CartState {
  currentDensityCalculation: DensityCalculation | null;
  densityCalculations: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: CartState = {
  currentDensityCalculation: null,
  densityCalculations: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Вспомогательная функция для получения черновика расчета
const getOrCreateDraftHelper = async () => {
  console.log('🔄 Вспомогательная функция: получение/создание черновика...');
  
  try {
    // Пробуем получить существующий черновик
    const response = await axiosInstance.get('/api/density_calculations/get_or_create_draft/');
    console.log('✅ Черновик получен через helper:', response.data);
    return response.data.density_calculation_id;
  } catch (error: any) {
    console.error('❌ Ошибка в helper:', error);
    throw error;
  }
};

export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🛒 Загрузка корзины...');
      const cartData = await apiService.getCart();
      console.log('✅ Корзина загружена:', cartData);
      return cartData;
    } catch (error: any) {
      console.error('getCart error:', error);
      
      // Если корзина не найдена, создаем черновик
      if (error.message?.includes('не найдена') || error.response?.status === 404) {
        try {
          console.log('🔄 Корзина не найдена, создаем черновик...');
          const draftId = await getOrCreateDraftHelper();
          
          // Получаем созданный черновик
          const draftData = await apiService.getDensityCalculationById(draftId);
          console.log('✅ Черновик создан и загружен:', draftData);
          return draftData;
        } catch (draftError: any) {
          console.error('Ошибка создания черновика:', draftError);
          return rejectWithValue('Не удалось создать расчет плотности');
        }
      }
      
      return rejectWithValue(error.message || 'Ошибка загрузки корзины');
    }
  }
);

export const getOrCreateDraftCalculation = createAsyncThunk(
  'cart/getOrCreateDraftCalculation',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Экшен: получение/создание черновика...');
      const response = await axiosInstance.get('/api/density_calculations/get_or_create_draft/');
      console.log('✅ Экшен: черновик получен:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Экшен: ошибка создания черновика:', error);
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Ошибка создания черновика расчета'
      );
    }
  }
);

export const addPopulationToDensityCalculation = createAsyncThunk(
  'cart/addPopulationToDensityCalculation',
  async ({ populationId, densityCalculationId, comment }: { 
    populationId: number; 
    densityCalculationId?: number;
    comment?: string;
  }, { rejectWithValue, getState, dispatch }) => {
    try {
      console.log('📝 Начало добавления населения в расчет:', { 
        populationId, 
        densityCalculationId,
        comment 
      });
      
      let calcId = densityCalculationId;
      const state = getState() as any;
      
      // Пытаемся получить ID из состояния
      if (!calcId && state.cart?.currentDensityCalculation?.id) {
        calcId = state.cart.currentDensityCalculation.id;
        console.log('✅ ID расчета из состояния Redux:', calcId);
      }
      
      // Если ID все еще нет, создаем новый черновик
      if (!calcId) {
        console.log('🔄 ID расчета не найден, создаем черновик...');
        try {
          const draftResponse = await axiosInstance.get('/api/density_calculations/get_or_create_draft/');
          calcId = draftResponse.data.density_calculation_id;
          
          if (!calcId) {
            throw new Error('Не удалось получить ID расчета после создания черновика');
          }
          
          console.log('✅ Создан черновик с ID:', calcId);
          
          // Обновляем состояние с новым черновиком
          dispatch(setCurrentDensityCalculationId(calcId));
          
        } catch (draftError: any) {
          console.error('❌ Ошибка создания черновика:', draftError);
          throw new Error(`Не удалось создать расчет плотности: ${draftError.response?.data?.error || draftError.message}`);
        }
      }
      
      console.log(`🛒 Добавляем население ${populationId} в расчет ${calcId}`);
      
      // Добавляем население в расчет
      const response = await axiosInstance.post(
        `/density_calculations/${calcId}/populations/`,
        { 
          population_id: populationId, 
          comment: comment || `Добавлено: ${new Date().toLocaleString('ru-RU')}` 
        }
      );
      
      console.log('✅ Население успешно добавлено. Ответ:', response.data);
      
      // Обновляем корзину после добавления
      const updatedCart = await apiService.getCart();
      console.log('✅ Обновленная корзина:', updatedCart);
      
      return updatedCart;
      
    } catch (error: any) {
      console.error('❌ Критическая ошибка добавления населения:', error);
      
      let errorMessage = 'Неизвестная ошибка';
      
      // Детальный парсинг ошибок
      if (error.response?.data) {
        console.log('📦 Данные ответа об ошибке:', error.response.data);
        
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('📋 Итоговое сообщение об ошибке:', errorMessage);
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const removePopulationFromDensityCalculation = createAsyncThunk(
  'cart/removePopulationFromDensityCalculation',
  async ({ densityCalculationId, populationId }: { 
    densityCalculationId: number; 
    populationId: number;
  }, { rejectWithValue }) => {
    try {
      console.log(`🗑️ Удаляем население ${populationId} из расчета ${densityCalculationId}`);
      const updatedDensityCalculation = await apiService.removePopulationFromDensityCalculation(densityCalculationId, populationId);
      console.log('✅ Население успешно удалено:', updatedDensityCalculation);
      return updatedDensityCalculation;
    } catch (error: any) {
      console.error('removePopulationFromDensityCalculation error:', error);
      return rejectWithValue(error.message || 'Ошибка удаления из корзины');
    }
  }
);

export const formDensityCalculation = createAsyncThunk(
  'cart/formDensityCalculation',
  async ({ densityCalculationId, territory_area }: { 
    densityCalculationId: number; 
    territory_area: number;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.formDensityCalculation(densityCalculationId, territory_area);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка формирования расчета плотности');
    }
  }
);

export const getDensityCalculations = createAsyncThunk(
  'cart/getDensityCalculations',
  async (_, { rejectWithValue }) => {
    try {
      const densityCalculations = await apiService.getDensityCalculations();
      return densityCalculations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка загрузки расчетов плотности');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.currentDensityCalculation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateCurrentDensityCalculation: (state, action) => {
      state.currentDensityCalculation = action.payload;
    },
    setCurrentDensityCalculation: (state, action) => {
      state.currentDensityCalculation = action.payload;
    },
    setCurrentDensityCalculationId: (state, action) => {
      if (state.currentDensityCalculation) {
        state.currentDensityCalculation.id = action.payload;
      } else {
        // Создаем минимальный объект расчета если его нет
        state.currentDensityCalculation = {
          id: action.payload,
          status: 'DRAFT',
          creation_datetime: new Date().toISOString(),
          client: 0,
          client_username: '',
          populations: [],
          populations_count: 0
        };
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // getCart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDensityCalculation = action.payload;
        state.lastUpdated = new Date().toISOString();
        console.log('🛒 Корзина загружена в состояние:', action.payload);
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('❌ Ошибка загрузки корзины:', action.payload);
      })
      
      // getOrCreateDraftCalculation
      .addCase(getOrCreateDraftCalculation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrCreateDraftCalculation.fulfilled, (state, action) => {
        state.loading = false;
        console.log('📝 Черновик расчета получен:', action.payload);
      })
      .addCase(getOrCreateDraftCalculation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('❌ Ошибка создания черновика:', action.payload);
      })
      
      // addPopulationToDensityCalculation
      .addCase(addPopulationToDensityCalculation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPopulationToDensityCalculation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDensityCalculation = action.payload;
        state.lastUpdated = new Date().toISOString();
        console.log('✅ Население добавлено, состояние обновлено:', action.payload);
      })
      .addCase(addPopulationToDensityCalculation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('❌ Ошибка добавления населения в состояние:', action.payload);
      })
      
      // removePopulationFromDensityCalculation
      .addCase(removePopulationFromDensityCalculation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removePopulationFromDensityCalculation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDensityCalculation = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(removePopulationFromDensityCalculation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // formDensityCalculation
      .addCase(formDensityCalculation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(formDensityCalculation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDensityCalculation = action.payload;
        state.densityCalculations = [action.payload, ...state.densityCalculations];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(formDensityCalculation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // getDensityCalculations
      .addCase(getDensityCalculations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDensityCalculations.fulfilled, (state, action) => {
        state.loading = false;
        state.densityCalculations = action.payload;
      })
      .addCase(getDensityCalculations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearCart, 
  clearError, 
  updateCurrentDensityCalculation,
  setCurrentDensityCalculation,
  setCurrentDensityCalculationId,
  setLoading
} = cartSlice.actions;

export default cartSlice.reducer;