import moment from 'moment';

export function formatDateTypeOne(date) {
  return moment(date).format('DD/MM/yyy HH:mm');
}
