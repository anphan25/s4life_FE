import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'app/slices/AuthSlice';
import hospitalReducer from 'app/slices/HospitalSlice';

export const store = configureStore({
  reducer: {
    hospital: hospitalReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});
