import axiosInstance from 'config/axiosConfig';

const apiPath = '/auth';

export function getAccessToken(refreshToken) {}

export async function loginUserPassword(params) {
  return await axiosInstance.post(apiPath + '/login', params);
}
