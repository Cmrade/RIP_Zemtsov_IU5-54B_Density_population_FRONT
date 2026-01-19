import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiService } from '../services/api';

// Типы на основе вашего API
interface PopulationInCart {
  id: number;
  population: number;
  population_title: string;
  population_image: string;
  comment: string;
  building_density?: number;
  people_per_building?: number;
}

export type DensityCalculationStatus = 'DRAFT' | 'FORMED' | 'COMPLETED' | 'REJECTED' | 'DELETED';

export interface DensityCalculation {
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

interface CartContextType {
  // Состояние
  currentDensityCalculation: DensityCalculation | null;
  densityCalculations: DensityCalculation[];
  loading: boolean;
  error: string | null;
  
  // Действия
  getCart: () => Promise<void>;
  getDensityCalculations: () => Promise<void>;
  getOrCreateDraftCalculation: () => Promise<{ density_calculation_id: number }>;
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
  updatePopulationComment: (
    densityCalculationId: number,
    populationId: number,
    comment: string
  ) => Promise<void>;
  clearError: () => void;
  refreshCart: () => Promise<void>;
}

// Создаем контекст с начальным значением undefined
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Создаем кастомный хук для использования контекста
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};

// Провайдер контекста
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Состояние корзины
  const [currentDensityCalculation, setCurrentDensityCalculation] = useState<DensityCalculation | null>(null);
  const [densityCalculations, setDensityCalculations] = useState<DensityCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Получение текущей корзины
  const getCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🛒 Загрузка корзины...');
      const cartData = await apiService.getCart();
      console.log('✅ Корзина загружена:', cartData);
      
      // Преобразуем данные в нужный формат
      const transformedData: DensityCalculation = {
        id: cartData.id,
        status: cartData.status,
        creation_datetime: cartData.creation_datetime,
        formation_datetime: cartData.formation_datetime,
        territory_area: cartData.territory_area,
        territory_area_formatted: cartData.territory_area_formatted,
        calculated_population: cartData.calculated_population,
        calculated_population_formatted: cartData.calculated_population_formatted,
        description: cartData.description,
        populations: (cartData.populations || []).map((pop: any) => ({
          id: pop.id,
          population: pop.population,
          population_title: pop.population_title,
          population_image: pop.population_image,
          comment: pop.comment || '',
          building_density: pop.building_density,
          people_per_building: pop.people_per_building
        }))
      };
      
      setCurrentDensityCalculation(transformedData);
    } catch (error: any) {
      console.error('❌ Ошибка загрузки корзины:', error);
      setError(error.message || 'Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение всех расчетов
  const getDensityCalculations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Загрузка всех расчетов...');
      const calculations = await apiService.getDensityCalculations();
      console.log('✅ Расчеты загружены:', calculations.length);
      
      const transformedCalculations: DensityCalculation[] = calculations.map((calc: any) => ({
        id: calc.id,
        status: calc.status,
        creation_datetime: calc.creation_datetime,
        formation_datetime: calc.formation_datetime,
        territory_area: calc.territory_area,
        territory_area_formatted: calc.territory_area_formatted,
        calculated_population: calc.calculated_population,
        calculated_population_formatted: calc.calculated_population_formatted,
        description: calc.description,
        populations: (calc.populations || []).map((pop: any) => ({
          id: pop.id,
          population: pop.population,
          population_title: pop.population_title,
          population_image: pop.population_image,
          comment: pop.comment || '',
          building_density: pop.building_density,
          people_per_building: pop.people_per_building
        }))
      }));
      
      setDensityCalculations(transformedCalculations);
    } catch (error: any) {
      console.error('❌ Ошибка загрузки расчетов:', error);
      setError(error.message || 'Ошибка загрузки расчетов плотности');
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение или создание черновика расчета
  const getOrCreateDraftCalculation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Получение или создание черновика...');
      const draftResult = await apiService.getOrCreateDraftCalculation();
      console.log('✅ Черновик получен:', draftResult);
      
      // После создания черновика обновляем корзину
      await getCart();
      
      return draftResult;
    } catch (error: any) {
      console.error('❌ Ошибка создания черновика:', error);
      setError(error.message || 'Ошибка создания черновика расчета');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCart]);

  // Добавление населения в расчет
  const addPopulationToDensityCalculation = useCallback(async (
    populationId: number, 
    densityCalculationId?: number, 
    comment?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Если не передан ID расчета, используем текущий
      const calcId = densityCalculationId || currentDensityCalculation?.id;
      
      if (!calcId) {
        // Если нет расчета, создаем черновик
        const draftResult = await getOrCreateDraftCalculation();
        const newCalcId = draftResult.density_calculation_id;
        
        console.log(`🛒 Добавление населения ${populationId} в расчет ${newCalcId}`);
        await apiService.addPopulationToDensityCalculation(newCalcId, populationId, comment);
      } else {
        console.log(`🛒 Добавление населения ${populationId} в расчет ${calcId}`);
        await apiService.addPopulationToDensityCalculation(calcId, populationId, comment);
      }
      
      // Обновляем корзину
      await getCart();
      console.log('✅ Население успешно добавлено');
      
    } catch (error: any) {
      console.error('❌ Ошибка добавления населения в расчет:', error);
      setError(error.message || 'Ошибка добавления типа населения в расчет');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentDensityCalculation?.id, getOrCreateDraftCalculation, getCart]);

  // Удаление населения из расчета
  const removePopulationFromDensityCalculation = useCallback(async (
    densityCalculationId: number, 
    populationId: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🗑️ Удаление населения ${populationId} из расчета ${densityCalculationId}`);
      await apiService.removePopulationFromDensityCalculation(densityCalculationId, populationId);
      
      // Обновляем корзину
      await getCart();
      console.log('✅ Население успешно удалено');
      
    } catch (error: any) {
      console.error('❌ Ошибка удаления населения из расчета:', error);
      setError(error.message || 'Ошибка удаления типа населения из расчета');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCart]);

  // Формирование расчета плотности
  const formDensityCalculation = useCallback(async (
    densityCalculationId: number, 
    territory_area: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📋 Формирование расчета ${densityCalculationId} с площадью ${territory_area} га`);
      await apiService.formDensityCalculation(densityCalculationId, territory_area);
      
      // Обновляем все данные
      await Promise.all([getCart(), getDensityCalculations()]);
      console.log('✅ Расчет успешно сформирован');
      
    } catch (error: any) {
      console.error('❌ Ошибка формирования расчета:', error);
      setError(error.message || 'Ошибка формирования расчета плотности');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCart, getDensityCalculations]);

  // Обновление комментария населения в расчете
  const updatePopulationComment = useCallback(async (
    densityCalculationId: number,
    populationId: number,
    comment: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`✏️ Обновление комментария для населения ${populationId} в расчете ${densityCalculationId}`);
      
      // В вашем API нет прямого метода для обновления комментария,
      // поэтому можно использовать существующий endpoint или создать новый
      // Для примера, предположим, что есть endpoint PUT /density_calculations/{id}/populations/{population_id}/
      // Так как его нет в вашем api.ts, я добавлю заглушку
      
      // Временное решение: удалить и добавить снова с новым комментарием
      await removePopulationFromDensityCalculation(densityCalculationId, populationId);
      await addPopulationToDensityCalculation(populationId, densityCalculationId, comment);
      
      console.log('✅ Комментарий успешно обновлен');
      
    } catch (error: any) {
      console.error('❌ Ошибка обновления комментария:', error);
      setError(error.message || 'Ошибка обновления комментария');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [removePopulationFromDensityCalculation, addPopulationToDensityCalculation]);

  // Обновление корзины
  const refreshCart = useCallback(async () => {
    await getCart();
  }, [getCart]);

  // Загружаем начальные данные при монтировании
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([getCart(), getDensityCalculations()]);
      } catch (error) {
        console.error('Ошибка загрузки начальных данных:', error);
      }
    };
    
    loadInitialData();
  }, [getCart, getDensityCalculations]);

  // Значение контекста
  const contextValue: CartContextType = {
    // Состояние
    currentDensityCalculation,
    densityCalculations,
    loading,
    error,
    
    // Действия
    getCart,
    getDensityCalculations,
    getOrCreateDraftCalculation,
    addPopulationToDensityCalculation,
    removePopulationFromDensityCalculation,
    formDensityCalculation,
    updatePopulationComment,
    clearError,
    refreshCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Экспортируем сам контекст для использования с useContext
export default CartContext;