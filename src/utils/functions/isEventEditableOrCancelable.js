import moment from 'moment';
import { EDIT_CANCEL_EVENT_VALID_PERIOD } from 'utils';

// Mode:
// 1: Edit
// 2: Cancel
export const isEventEditableOrCancelable = (numberOfRegistration, startDate, role, mode) => {
  //Admin only cancel
  if (role === 'Admin' && mode === 2) {
    return true;
  }

  if (numberOfRegistration > 0) {
    return false;
  }

  if (!moment().isBefore(moment(startDate).subtract(EDIT_CANCEL_EVENT_VALID_PERIOD, 'days'))) {
    return false;
  }

  return true;
};
