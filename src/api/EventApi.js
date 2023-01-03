import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/events';

export function getEvents(params) {
  return axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export function getEventDetailByEventId(eventId) {
  return axiosInstance.get(`${apiPath}/${eventId}`);
}

export function createEvent(params) {
  return axiosInstance.post(apiPath, params);
}

export async function editEvent(params) {
  return await axiosInstance.patch(apiPath, params);
}

export async function cancelEvent(eventId) {
  return await axiosInstance.delete(`${apiPath}/${eventId}`);
}
