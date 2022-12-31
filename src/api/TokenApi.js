import { axiosInstance } from 'config';

const apiPath = '/tokens';

export async function getAccessToken(refreshToken) {
  return await axiosInstance.post(apiPath + '/exchange', { refreshToken });
}
