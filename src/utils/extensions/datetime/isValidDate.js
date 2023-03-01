import moment from 'moment';

export const isValidDate = (value, originalValue) => {
  if (this.isType(value)) {
    return value;
  }
  return moment(value, 'dd/MM/yyyy', true).isValid();
};
