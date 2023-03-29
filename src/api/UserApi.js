import { axiosInstance } from 'config';
import queryString from 'query-string';
import { UserStatusEnum } from 'utils';

const apiPath = '/users';

export async function getUsers(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export async function addUser(params) {
  return await axiosInstance.post(apiPath, params);
}

export async function disableUser(userId) {
  return await axiosInstance.patch(apiPath, { userId, status: UserStatusEnum.Disabled });
}

export async function enableUser(userId) {
  return await axiosInstance.patch(apiPath, { userId, status: UserStatusEnum.Active });
}
