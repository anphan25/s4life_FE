import moment from 'moment';

export const isValidTime = (value) => {
  if (!value) return false;

  const result = moment(value, 'HH:mm', true).isValid();
  return result;
};
