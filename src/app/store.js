import { configureStore } from "@reduxjs/toolkit";
import authReducer from "app/slices/AuthSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
