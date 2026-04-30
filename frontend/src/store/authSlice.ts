import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

// Проверяем, не истёк ли токен
function getValidToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Если есть срок и он истёк — удаляем токен
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
  token: getValidToken(), // ← Теперь проверяем срок
  isAdmin: false,
  isLoading: !!getValidToken(), // Загружаем только если есть токен
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
      state.isAdmin = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setToken, setAdmin, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;