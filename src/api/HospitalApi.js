import axiosInstance from 'config/axiosConfig';

const apiPath = '/hospitals';

export async function importCSVHospitalData(params) {
  console.log('params: ', params);
  return await axiosInstance.post(apiPath + '/import', params);
}
