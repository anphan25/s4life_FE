import { createSlice } from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';

const getAuthState = () => {
  const storedValue = sessionStorage.getItem('authTokens');
  const authTokens = storedValue ? JSON.parse(storedValue) : null;
  if (authTokens) {
    const decode = jwtDecode(authTokens.accessToken);
    return {
      ...authTokens,
      user: decode,
    };
  }
  return null;
};

const initialState = {
  error: '',
  isLoading: false,
  auth: getAuthState(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authPending: (state) => {
      state.isLoading = true;
    },
    clearMessage: (state) => {
      state.error = '';
    },
    loginSuccess: (state, action) => {
      state.auth = action.payload;
      state.isLoading = false;
    },
    loginFail: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.auth = null;
      sessionStorage.removeItem('authTokens');
    },
    setToken: (state, action) => {
      state.auth.accessToken = action.payload;
      state.auth.user = jwtDecode(action.payload);
      sessionStorage.setItem(
        'authTokens',
        JSON.stringify({
          accessToken: state.auth.accessToken,
          refreshToken: state.auth.refreshToken,
        })
      );
    },
    refreshFail: (state) => {
      state.auth = null;
      sessionStorage.removeItem('authTokens');
    },
  },
});

export const { authPending, loginFail, loginSuccess, logoutSuccess, setToken, refreshFail, clearMessage } =
  authSlice.actions;

export default authSlice.reducer;
