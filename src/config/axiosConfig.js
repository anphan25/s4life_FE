import { getAccessToken } from 'api';
import { refreshFail, setToken } from 'app/slices/AuthSlice';
import axios from 'axios';

export let axiosInstance = null;

export const setupAxiosInstance = (store) => {
  axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = store.getState().auth.auth?.accessToken;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response.data.result,
    (error) => {
      const prevRequest = error?.config;
      if (error?.response?.status === 401 && !prevRequest?.sent) {
        return getAccessToken(store.getState().auth.auth?.refreshToken)
          .then(async (res) => {
            store.dispatch(setToken(res));
            return await axiosInstance({
              ...prevRequest,
              headers: { ...prevRequest.headers, Authorization: `Bearer ${res}` },
              sent: true,
            });
          })
          .catch((err) => store.dispatch(refreshFail()));
      }

      return Promise.reject(error);
    }
  );
};
