import { axiosInstance } from 'config';

const apiPath = '/auth';

export async function loginUserPassword(params) {
  return await axiosInstance.post(apiPath + '/login', params);
}

export async function changePassword(params) {
  return await axiosInstance.patch(apiPath + '/change-password', params);
}
