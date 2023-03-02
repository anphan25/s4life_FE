import moment from 'moment';

export const isValidDate = (value) => {
  if (!value) return false;

  return moment(value, 'dd/MM/yyyy', true).isValid();
};
