import axiosInstance from 'config/axiosConfig';
import queryString from 'query-string';

const apiPath = '/hospitals';

export async function importCSVHospitalData(params) {
  return await axiosInstance.post(apiPath + '/import', params);
}
export async function getHospitalsList(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export async function disableHospital(hospitalId) {
  return await axiosInstance.delete(`${apiPath}/${hospitalId}`);
}

export async function enableHospital(hospitalId) {
  return await axiosInstance.patch(`${apiPath}/${hospitalId}/enable`);
}
