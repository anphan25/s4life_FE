import moment from 'moment';

export const isValidTime = (value, originalValue) => {
  if (this.isType(value)) {
    return value;
  }

  const result = moment(value, 'HH:mm', true).isValid();
  return result;
};
