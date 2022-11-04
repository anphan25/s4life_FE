import axiosInstance from 'config/axiosConfig';
import queryString from 'query-string';

const apiPath = '/hospitals';

export async function importCSVHospitalData(params) {
  console.log('params: ', params);
  return await axiosInstance.post(apiPath + '/import', params);
}
export async function getHospitalsList(params) {
  console.log('params: ', params);
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}
