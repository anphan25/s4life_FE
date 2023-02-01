import { axiosInstance } from 'config';
import queryString from 'query-string';

const apiPath = '/blood-donation-approvals';

export async function getBloodDonationApprovalList(params) {
  return await axiosInstance.get(`${apiPath}?${queryString.stringify(params)}`);
}

export async function getBloodDonationApprovalById(id) {
  return await axiosInstance.get(`${apiPath}/${id}`);
}

export async function updateApproveBloodDonation(requestId, bloodDonationApprovals) {
  console.log('params', { requestId, bloodDonationApprovals });
  return await axiosInstance.patch(`${apiPath}`, { requestId, bloodDonationApprovals });
}
