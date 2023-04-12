import moment from 'moment';
import { EDIT_CANCEL_EVENT_VALID_PERIOD } from 'utils';

// Only manger use this function
export const isEventEditable = (currentParticipation, startDate) => {
  if (currentParticipation > 0) {
    return false;
  }

  if (!moment().isBefore(moment(startDate).subtract(EDIT_CANCEL_EVENT_VALID_PERIOD, 'days'))) {
    return false;
  }

  return true;
};
