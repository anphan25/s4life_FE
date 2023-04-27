import { axiosInstance } from 'config';

const apiPath = '/system-configurations';

export async function getSystemConfig() {
  return await axiosInstance.get(`${apiPath}`);
}

export async function updateSystemConfig(params) {
  return await axiosInstance.patch(`${apiPath}`, params);
}
