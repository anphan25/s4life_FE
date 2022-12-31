import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'app/slices/AuthSlice';
import hospitalReducer from 'app/slices/HospitalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hospital: hospitalReducer,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: false,
  //     immutableCheck: false,
  //   }),
});
