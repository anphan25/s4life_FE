import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/locations';

export async function getLocations(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}
