import { axiosInstance } from 'config';

const apiPath = '/administrative-divisions';

export async function getAllProvinces(depth) {
  return await axiosInstance.get(`${apiPath}/provinces?depth=${depth}`);
}
export async function getDistrictsByProvinceId(depth, provinceId) {
  return await axiosInstance.get(`${apiPath}/districts?depth=${depth}&provinceId=${provinceId}`);
}
