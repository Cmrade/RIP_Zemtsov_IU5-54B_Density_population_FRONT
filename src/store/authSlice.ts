import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../services/axiosInstance';
import { User } from '../types';
import axiosInstance from '../services/axiosInstance';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Проверяем, была ли страница обновлена
const checkIfPageWasReloaded = () => {
  const lastReload = localStorage.getItem('lastPageReload');
  const now = Date.now();
  
  // Если с момента последнего обновления прошло меньше 2 секунд, считаем что страница была обновлена
  if (lastReload && (now - parseInt(lastReload)) < 2000) {
    return true;
  }
  
  // Сохраняем время текущей загрузки
  localStorage.setItem('lastPageReload', now.toString());
  return false;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Автоматически разлогиниваем при обновлении страницы
if (checkIfPageWasReloaded()) {
  console.log('Обнаружено обновление страницы - сбрасываем аутентификацию');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Инициализируем состояние из localStorage (если пользователь не был разлогинен)
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

if (!checkIfPageWasReloaded() && storedToken) {
  initialState.token = storedToken;
  initialState.isAuthenticated = true;
  if (storedUser) {
    try {
      initialState.user = JSON.parse(storedUser);
    } catch (e) {
      console.error('Ошибка при парсинге пользователя из localStorage:', e);
    }
  }
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/users/login/', {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка авторизации');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/users/register/', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка регистрации');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return null;
});

export const getProfile = createAsyncThunk(
  'auth/profile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users/profile/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки профиля');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    // Добавленный синхронный экшен для немедленного разлогинивания
    logoutImmediate: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

// Обновляем экспорт, добавляя новый экшен
export const { clearError, setUser, logoutImmediate } = authSlice.actions;
export default authSlice.reducer;