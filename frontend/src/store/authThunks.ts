import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';
import { setToken, setAdmin, logout } from './authSlice';

const API_URL = 'http://127.0.0.1:8000';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { dispatch }) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Ошибка входа');
    }

    const data = await response.json();
    dispatch(setToken(data.access_token));
    return data;
  }
);

export const checkAdminStatus = createAsyncThunk(
  'auth/checkAdmin',
  async (_, { dispatch, getState }) => {
    try {
      const response = await apiClient.get('/auth/admin-check');
      dispatch(setAdmin(response.status === 200));
    } catch {
      dispatch(setAdmin(false));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    dispatch(logout());
  }
);