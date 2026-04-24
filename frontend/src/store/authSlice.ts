import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAdmin: false,
  isLoading: true,
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
    logout: (state) => {
      state.token = null;
      state.isAdmin = false;
      localStorage.removeItem('token');
    },
  },
});

export const { setToken, setAdmin, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;