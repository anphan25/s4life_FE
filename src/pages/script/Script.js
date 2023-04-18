import axios from 'axios';

export const StaffAccount = {
  username: 'choraystaff1',
  password: 'Staff@123',
};

export const listVolunteerAccount = [
  'tinhnguyenvientest0010',
  'tinhnguyenvientest0011',
  'tinhnguyenvientest00110',
  'tinhnguyenvientest00111',
  'tinhnguyenvientest00112',
  'tinhnguyenvientest00113',
  'tinhnguyenvientest00114',
  'tinhnguyenvientest00115',
  'tinhnguyenvientest00116',
  'tinhnguyenvientest00117',
  'tinhnguyenvientest00118',
  'tinhnguyenvientest00119',
  'tinhnguyenvientest0012',
  'tinhnguyenvientest00120',
  'tinhnguyenvientest00121',
  'tinhnguyenvientest00122',
  'tinhnguyenvientest00123',
  'tinhnguyenvientest00124',
  'tinhnguyenvientest00125',
  'tinhnguyenvientest00126',
  'tinhnguyenvientest00127',
  'tinhnguyenvientest00128',
  'tinhnguyenvientest00129',
  'tinhnguyenvientest0013',
  'tinhnguyenvientest00130',
  'tinhnguyenvientest00131',
  'tinhnguyenvientest00132',
  'tinhnguyenvientest00133',
  'tinhnguyenvientest00134',
  'tinhnguyenvientest00135',
  'tinhnguyenvientest00136',
  'tinhnguyenvientest00137',
  'tinhnguyenvientest00138',
  'tinhnguyenvientest00139',
  'tinhnguyenvientest0014',
  'tinhnguyenvientest00140',
  'tinhnguyenvientest00141',
  'tinhnguyenvientest00142',
  'tinhnguyenvientest00143',
  'tinhnguyenvientest00144',
  'tinhnguyenvientest00145',
  'tinhnguyenvientest00146',
  'tinhnguyenvientest00147',
  'tinhnguyenvientest00148',
  'tinhnguyenvientest0015',
  'tinhnguyenvientest00150',
  'tinhnguyenvientest0016',
  'tinhnguyenvientest0017',
  'tinhnguyenvientest0018',
  'tinhnguyenvientest0019',
];

export const listReject = [
  'tinhnguyenvientest00150',
  'tinhnguyenvientest0016',
  'tinhnguyenvientest0017',
  'tinhnguyenvientest0018',
  'tinhnguyenvientest0019',
];

function setupAxios(accessToken) {
  var axiosScript = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return axiosScript;
}

export async function loginOTP(params) {
  return await setupAxios().post('/auth/otp-sign-in', params);
}

export async function registerEvent(params, accessToken) {
  return await setupAxios(accessToken).post('/event-registrations', params);
}

export async function getEventRegistrationById(id, accessToken) {
  return await setupAxios(accessToken).get(`/event-registrations/${id}`);
}

export async function editEventRegistration(params, accessToken) {
  return await setupAxios(accessToken).patch('/event-registrations', params);
}
