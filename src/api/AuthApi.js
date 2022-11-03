import axiosInstance from 'config/axiosConfig';

const apiPath = '/auth';

export async function loginUserPassword(params) {
  return await axiosInstance.post(apiPath + '/login', params);
}
