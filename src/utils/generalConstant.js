export const MAX_INT = 2147483647;
export const PHONE_NUMBER_PATTERN = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/;

export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&\/]).{8,}$/;

export const DEFAULT_EVENT_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/s4life.appspot.com/o/s4life-banner-event%2Fs4life_banner.jpg?alt=media&token=76b3f184-140a-4c42-b849-003a6f0e3629';

export const DEFAULT_HOSPITAL_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/s4life.appspot.com/o/hospital-images%2Fs4life_logo.png?alt=media&token=ab085d53-a12d-4a83-b222-b0ac856b718a';

export const BLOOD_TYPE = [
  { bloodTypeId: 1, isRhNegative: true },
  { bloodTypeId: 1, isRhNegative: false },
  { bloodTypeId: 2, isRhNegative: true },
  { bloodTypeId: 2, isRhNegative: false },
  { bloodTypeId: 3, isRhNegative: true },
  { bloodTypeId: 3, isRhNegative: false },
  { bloodTypeId: 4, isRhNegative: true },
  { bloodTypeId: 4, isRhNegative: false },
];
export const EDIT_CANCEL_EVENT_VALID_PERIOD = 3;
