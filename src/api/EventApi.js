import axiosInstance from 'config/axiosConfig';
import queryString from 'query-string';

const apiPath = '/events';

export async function getEvent(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export async function getEventDetailByEventId(eventId) {
  return await axiosInstance.get(`${apiPath}/${eventId}`);
}

export async function createEvent(params) {
  return await axiosInstance.post(apiPath, params);
}

export async function cancelEvent(eventId) {
  return await axiosInstance.patch(`${apiPath}/${eventId}/cancel`);
}
