import axiosInstance from 'config/axiosConfig';
import queryString from 'query-string';

const apiPath = '/event-registrations';

export async function getEventRegistrations(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

//Demo
export async function registerEvent(params) {
  return await axiosInstance.post(apiPath, params);
}
