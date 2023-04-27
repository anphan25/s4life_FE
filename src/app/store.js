import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'app/slices/AuthSlice';
import hospitalReducer from 'app/slices/HospitalSlice';
import configReducer from 'app/slices/ConfigSlice';

export const store = configureStore({
  reducer: {
    hospital: hospitalReducer,
    auth: authReducer,
    config: configReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});
