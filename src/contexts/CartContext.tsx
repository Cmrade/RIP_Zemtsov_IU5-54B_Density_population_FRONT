import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiService } from '../services/api';

// Базовые типы без зависимости от внешних типов
interface PopulationInCart {
  id: number;
  population: number;
  population_title: string;
  population_image: string;
  comment: string;
  building_density?: number;
  people_per_building?: number;
}

type DensityCalculationStatus = 'DRAFT' | 'FORMED' | 'COMPLETED' | 'REJECTED' | 'DELETED';

interface DensityCalculation {
  id: number;
  status: DensityCalculationStatus;
  creation_datetime: string;
  formation_datetime?: string;
  territory_area?: number;
  territory_area_formatted?: string;
  calculated_population?: number;
  calculated_population_formatted?: string;
  description?: string;
  populations: PopulationInCart[];
}

interface CartState {
  currentDensityCalculation: DensityCalculation | null;
  densityCalculations: DensityCalculation[];
  loading: boolean;
  error: string | null;
}

interface CartActions {
  getCart: () => Promise<void>;
  getDensityCalculations: () => Promise<void>;
  addPopulationToDensityCalculation: (
    populationId: number, 
    densityCalculationId?: number, 
    comment?: string
  ) => Promise<void>;
  removePopulationFromDensityCalculation: (
    densityCalculationId: number, 
    populationId: number
  ) => Promise<void>;
  formDensityCalculation: (
    densityCalculationId: number, 
    territory_area: number
  ) => Promise<void>;
  clearError: () => void;
}

type CartContextType = CartState & CartActions;

// Создаем контекст
const CartContext = createContext<CartContextType | undefined>(undefined);

// Хук для использования контекста
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Провайдер контекста
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Состояние корзины
  const [state, setState] = useState<CartState>({
    currentDensityCalculation: null,
    densityCalculations: [],
    loading: false,
    error: null,
  });

  // Очистка ошибки
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Преобразование данных из API в наш тип
  const transformDensityCalculation = (data: any): DensityCalculation => {
    return {
        id: data.id,
        status: data.status,
        creation_datetime: data.creation_datetime,
        formation_datetime: data.formation_datetime,
        territory_area: data.territory_area,
        territory_area_formatted: data.territory_area_formatted,
        calculated_population: data.calculated_population,
        calculated_population_formatted: data.calculated_population_formatted,
        description: data.description,
        populations: (data.populations || []).map((pop: any) => ({
        id: pop.id,
        population: pop.population,
        population_title: pop.population_title,
        population_image: pop.population_image,
        comment: pop.comment || '',
        building_density: pop.building_density,
        people_per_building: pop.people_per_building
        }))
    };
    };

  // Получение текущей корзины
  const getCart = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const cartData = await apiService.getCart();
      console.log('📦 Cart data loaded:', cartData);
      
      const transformedData = cartData ? transformDensityCalculation(cartData) : null;
      
      setState(prev => ({ 
        ...prev, 
        currentDensityCalculation: transformedData,
        loading: false 
      }));
    } catch (error: any) {
      console.error('❌ Error loading cart:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Ошибка загрузки корзины',
        loading: false 
      }));
    }
  }, []);

  // Получение всех расчетов
  const getDensityCalculations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const calculations = await apiService.getDensityCalculations();
      console.log('📊 Density calculations loaded:', calculations.length);
      
      const transformedCalculations = calculations.map(transformDensityCalculation);
      
      setState(prev => ({ 
        ...prev, 
        densityCalculations: transformedCalculations,
        loading: false 
      }));
    } catch (error: any) {
      console.error('❌ Error loading density calculations:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Ошибка загрузки расчетов плотности',
        loading: false 
      }));
    }
  }, []);

  // Добавление населения в расчет
  const addPopulationToDensityCalculation = useCallback(async (
    populationId: number, 
    densityCalculationId?: number, 
    comment?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Если не передан ID расчета, используем текущий
      const calcId = densityCalculationId || state.currentDensityCalculation?.id;
      
      if (!calcId) {
        throw new Error('Не найден расчет плотности. Создайте новый расчет.');
      }
      
      await apiService.addPopulationToDensityCalculation(calcId, populationId, comment);
      
      // Обновляем данные корзины
      await getCart();
      
      console.log('✅ Population added to calculation');
    } catch (error: any) {
      console.error('❌ Error adding population to calculation:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Ошибка добавления типа населения в расчет',
        loading: false 
      }));
      throw error;
    }
  }, [state.currentDensityCalculation?.id, getCart]);

  // Удаление населения из расчета
  const removePopulationFromDensityCalculation = useCallback(async (
    densityCalculationId: number, 
    populationId: number
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await apiService.removePopulationFromDensityCalculation(densityCalculationId, populationId);
      
      // Обновляем данные корзины
      await getCart();
      
      console.log('✅ Population removed from calculation');
    } catch (error: any) {
      console.error('❌ Error removing population from calculation:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Ошибка удаления типа населения из расчета',
        loading: false 
      }));
      throw error;
    }
  }, [getCart]);

  // Формирование расчета плотности
  const formDensityCalculation = useCallback(async (
    densityCalculationId: number, 
    territory_area: number
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await apiService.formDensityCalculation(densityCalculationId, territory_area);
      
      // Обновляем все данные
      await Promise.all([getCart(), getDensityCalculations()]);
      
      console.log('✅ Density calculation formed successfully');
    } catch (error: any) {
      console.error('❌ Error forming density calculation:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Ошибка формирования расчета плотности',
        loading: false 
      }));
      throw error;
    }
  }, [getCart, getDensityCalculations]);

  // Загружаем данные при монтировании
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([getCart(), getDensityCalculations()]);
      } catch (error) {
        console.error('Error loading initial cart data:', error);
      }
    };
    
    loadInitialData();
  }, [getCart, getDensityCalculations]);

  // Значение контекста
  const contextValue: CartContextType = {
    // Состояние
    currentDensityCalculation: state.currentDensityCalculation,
    densityCalculations: state.densityCalculations,
    loading: state.loading,
    error: state.error,
    
    // Действия
    getCart,
    getDensityCalculations,
    addPopulationToDensityCalculation,
    removePopulationFromDensityCalculation,
    formDensityCalculation,
    clearError,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Вспомогательные хуки для конкретных данных
export const useCartState = () => {
  const { currentDensityCalculation, densityCalculations, loading, error } = useCart();
  return { currentDensityCalculation, densityCalculations, loading, error };
};

export const useCartActions = () => {
  const { 
    getCart, 
    getDensityCalculations, 
    addPopulationToDensityCalculation, 
    removePopulationFromDensityCalculation, 
    formDensityCalculation,
    clearError 
  } = useCart();
  
  return { 
    getCart, 
    getDensityCalculations, 
    addPopulationToDensityCalculation, 
    removePopulationFromDensityCalculation, 
    formDensityCalculation,
    clearError 
  };
};