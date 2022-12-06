import axiosInstance from 'config/axiosConfig';
import queryString from 'query-string';

const apiPath = '/user-informations';

export async function updateBloodType(params) {
  return await axiosInstance.patch(apiPath, params);
}
