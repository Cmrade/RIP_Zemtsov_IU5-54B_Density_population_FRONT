import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from '../features/filters/filtersSlice';

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Тип для всего состояния приложения
export type RootState = ReturnType<typeof store.getState>;

// Тип для dispatch
export type AppDispatch = typeof store.dispatch;