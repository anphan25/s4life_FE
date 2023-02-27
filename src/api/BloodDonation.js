import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/blood-donations';

export async function getBloodDonations(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}
