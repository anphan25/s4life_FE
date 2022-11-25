import axiosInstance from 'config/axiosConfig';
import queryString from 'query-string';

const apiPath = '/events';

export async function getEvent(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export async function cancelEvent(eventId) {
  return await axiosInstance.patch(`${apiPath}/${eventId}/cancel`);
}
