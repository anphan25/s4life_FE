import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getHospitalById } from 'api';
// import { getHospitalById } from 'api';

const initialState = {
  isLoading: false,
  error: '',
  data: null,
};

export const hospitalSlice = createSlice({
  name: 'hospital',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getHospital.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getHospital.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(getHospital.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    });
  },
});

const moveToIndex = (arr, from, to) => {
  arr.splice(to, 0, arr.splice(from, 1)[0]);
};

export const getHospital = createAsyncThunk('hospital/getHospitalById', async (hospitalId) => {
  const response = await getHospitalById(hospitalId);
  response.openingTime.sort((a, b) => a.day - b.day);
  moveToIndex(response.openingTime, 0, response.openingTime.length - 1);
  return response;
});

export default hospitalSlice.reducer;
