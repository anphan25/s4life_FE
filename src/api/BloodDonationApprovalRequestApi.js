import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/blood-donation-approval-requests';

export async function getBloodDonationApprovalRequests(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export async function getBloodDonationApprovalRequestById(id) {
  return await axiosInstance.get(`${apiPath}/${id}`);
}
