import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/user-informations';

export async function updateBloodType(params) {
  return await axiosInstance.patch(apiPath, params);
}

export async function getUserInfoById(id) {
  return await axiosInstance.get(`${apiPath}/${id}`);
}
