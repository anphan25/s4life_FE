import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/event-registrations';

export async function getEventRegistrations(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export async function getEventRegistrationById(id, op) {
  return await axiosInstance.get(`${apiPath}/${id}?op=${op}`);
}
