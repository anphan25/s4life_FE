import axiosInstance from 'config/axiosConfig';
import queryString from 'query-string';

const apiPath = '/users';

export async function getUsers(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}
