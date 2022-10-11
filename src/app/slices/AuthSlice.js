import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // error: "",
  // isLoading: false,
  // auth: getAuthState(),
  user: null,
};

export const authSlice = createSlice({ name: "auth", initialState });

export const {} = authSlice.actions;

export default authSlice.reducer;
