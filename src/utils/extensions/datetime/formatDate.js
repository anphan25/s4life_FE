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

    case 3: {
      dateStringFormat = moment(date).format('DD MMMM, YYYY');
      break;
    }

    case 4: {
      dateStringFormat = moment(date).format('DD MMM, YYYY');
      break;
    }

    case 5: {
      dateStringFormat = moment(date).format('yyyy-MM-DD');
      break;
    }

    default: {
      dateStringFormat = moment(date).format('DD/MM/yyy');
      break;
    }
  }

  return dateStringFormat;
}
