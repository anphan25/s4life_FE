import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSystemConfig } from 'api';

const initialState = {
  isLoading: false,
  error: '',
  data: {
    maxDaysEventDuration: 30,
    maxDaysUntilEventStart: 365,
    minDaysUntilFixedEventStart: 1,
    minDaysUntilMobileEventStart: 7,
    minDaysUntilMobileEventFromIntendedEventStart: 1,
  },
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    pending: (state) => {
      state.isLoading = true;
    },
    setConfig: (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    },
    hasError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getConfig.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getConfig.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(getConfig.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    });
  },
});

export const getConfig = createAsyncThunk('config/getConfig', async () => {
  const response = await getSystemConfig();

  console.log('response', response);
  return response;
});

export const { pending, hasError, setConfig } = configSlice.actions;

export default configSlice.reducer;
