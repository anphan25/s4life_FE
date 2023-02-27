import moment from 'moment';

export default function isValidDate(value, originalValue) {
  if (this.isType(value)) {
    return value;
  }
  return moment(value, 'dd/MM/yyyy', true).isValid();
}
