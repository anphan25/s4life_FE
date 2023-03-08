import { axiosInstance } from 'config';

const apiPath = '/user-informations';

export async function updateUserInfo(params) {
  return await axiosInstance.patch(apiPath, params);
}

export async function getUserInfoById(id) {
  return await axiosInstance.get(`${apiPath}/${id}`);
}
