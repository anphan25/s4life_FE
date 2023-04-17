import moment from 'moment';

export const isStartAndEndDateIsSame = (startDate, endDate) => {
  return moment(startDate).isSame(moment(endDate), 'dates');
};
