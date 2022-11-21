import moment from 'moment';

export function formatDate(date, type) {
  let dateStringFormat = '';
  switch (type) {
    case 1: {
      dateStringFormat = moment(date).format('DD/MM/yyy HH:mm');
      break;
    }
    case 2: {
      dateStringFormat = moment(date).format('DD/MM/yyy');
      break;
    }

    default: {
    }
  }

  return dateStringFormat;
}
