import axios from 'axios';

export const StaffAccount = {
  username: 'choraystaff1',
  password: 'Staff@123',
};

export const listVolunteerAccount = [
  '+84906468701',
  '+84906468711',
  '+84906468721',
  '+84906468731',
  '+84906468741',
  '+84906468761',
  '+84906468771',
  '+84906468781',
  '+84906468791',
  '+84906468800',
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

export async function editRegistrationForm(params, accessToken) {
  return await setupAxios(accessToken).patch('/event-registrations', params);
}

export async function confirmRegistrationForm(params, accessToken) {
  return await setupAxios(accessToken).patch('/event-registrations/confirm', params);
}
