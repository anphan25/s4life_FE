import moment from 'moment';

export function formatDate(date, type) {
  let dateStringFormat = '';
  switch (type) {
    case 1: {
      dateStringFormat = moment(date).format('DD/MM/yyy HH:mm');
    }
    default: {
    }
  }

  return dateStringFormat;
}
