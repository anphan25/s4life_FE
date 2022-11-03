import axiosInstance from 'config/axiosConfig';

const apiPath = '/tokens';

export async function getAccessToken(refreshToken) {
  return await axiosInstance.post(apiPath + '/exchange', { refreshToken });
}
