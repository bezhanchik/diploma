// src/store/store.ts (или authSlice.ts)
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// 1. Описываем тип пользователя
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: User | null; // ✅ Добавляем поле для данных пользователя
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

function getValidToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  } catch {
    localStorage.removeItem('token');
    return null;
  }
}

const initialState: AuthState = {
  token: getValidToken(),
  user: null, // ✅ Инициализируем как null
  isAdmin: false,
  isLoading: !!getValidToken(),
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    // ✅ Новое действие для сохранения данных пользователя
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null; // ✅ Очищаем пользователя при выходе
      state.isAdmin = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
});

// Экспортируем новые действия
export const { setToken, setUser, setAdmin, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;