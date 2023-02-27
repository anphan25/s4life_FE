import moment from 'moment';

//Notice !!!!
// The date param in this function is supposed to VN time
// Because in database the time will be stored as VN time and moment auto display time in local time (that means the original value is VN time, but moment +7h automatically) so that .utc() added to display Vn time correctly
export function formatDate(date, type) {
  let dateStringFormat = '';
  switch (type) {
    case 1: {
      dateStringFormat = moment(date).utc().format('DD/MM/yyy HH:mm');
      break;
    }
    case 2: {
      dateStringFormat = moment(date).utc().format('DD/MM/yyy');
      break;
    }

    case 3: {
      dateStringFormat = moment(date).utc().format('DD MMMM, YYYY');
      break;
    }

    case 4: {
      dateStringFormat = moment(date).utc().format('DD MMM, YYYY');
      break;
    }

    default: {
      dateStringFormat = moment(date).utc().format('DD/MM/yyy');
      break;
    }
  }

  return dateStringFormat;
}
