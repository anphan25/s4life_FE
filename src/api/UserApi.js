import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/users';

export async function getUsers(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export async function addUser(params) {
  return await axiosInstance.post(apiPath, params);
}
