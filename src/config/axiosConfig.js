import { getAccessToken } from "api";
import { store } from "app/store";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-type": "application/json; charset=utf-8",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = store.getState().auth.auth?.accessToken;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response.data.result,
  async (error) => {
    if (error?.response?.status === 401) {
      await getAccessToken(store.getState().auth.auth?.refreshToken)
        .then((res) => {
          error.config.headers["Authorization"] = `Bearer ${res?.accessToken}`;
          // store.dispatch(setToken(res?.accessToken));
          // store.dispatch(setUserInfo(jwtDecode(res?.accessToken)));
          return axiosInstance(error?.config);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
);

export default axiosInstance;
