export const PHONE_NUMBER_PATTERN = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/;
export const USERNAME_PATTERN = /^[a-zA-Z]{1}[a-zA-Z0-9]{4,256}$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&\/]).{9,}$/;
export const NUMBER_PATTERN = /^[0-9]+$/;
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const LONGITUDE_PATTERN = /^(-?\d{1,3}(?:\.\d+)?)$/;
export const LATITUDE_PATTERN = /^(-?\d{1,2}(?:\.\d+)?)$/;
export const NATIONALID_PATTERN = /^[0-9]{9,12}$/;
