import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/blood-donation-approvals';

export async function getBloodDonationApprovalList(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export async function getBloodDonationApprovalById(id) {
  return await axiosInstance.get(`${apiPath}/${id}`);
}

export async function approveBloodDonation(id) {
  return await axiosInstance.patch(`${apiPath}`, { id, status: 1 });
}

export async function rejectBloodDonation(id, note) {
  return await axiosInstance.patch(`${apiPath}`, { id, status: 0, note });
}
