import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/blood-donation-approvals'

export async function getApprovalUsers(params) {
    return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
  }