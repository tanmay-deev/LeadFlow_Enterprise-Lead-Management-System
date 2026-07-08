import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  user: null, // User details will be populated later
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, access_token, user } = action.payload || {};
      const authToken = token ?? access_token;

      if (authToken) {
        state.token = authToken;
        state.user = user;
        state.isAuthenticated = true;
        localStorage.setItem('token', authToken);
      }
    },
    login: (state, action) => {
      const { token, access_token, user } = action.payload || {};
      const authToken = token ?? access_token;

      if (authToken) {
        state.token = authToken;
        state.user = user;
        state.isAuthenticated = true;
        localStorage.setItem('token', authToken);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setCredentials, login, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
