import axios from 'axios';

export const listVolunteerAccount = [
  '+84906468701',
  '+84906468711',
  '+84906468721',
  '+84906468731',
  '+84906468741',
  '+84906468761',
];

export async function loginOTP(params) {
  return await axios({
    baseURL: process.env.REACT_APP_BASE_API_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/auth/otp-sign-in',
    method: 'post',
    data: params,
  });
}

export async function registerEvent(params, accessToken) {
  return await axios({
    baseURL: process.env.REACT_APP_BASE_API_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    url: '/event-registrations',
    method: 'post',
    data: params,
  });
}
