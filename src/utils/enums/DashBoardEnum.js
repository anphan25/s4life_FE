export const DashBoardEnum = Object.freeze({
  EventStatistic: {
    UNSTARTED_GROUP: 1,
    STARTED_GROUP: 2,
    FINISHED_GROUP: 3,
    CANCELED_GROUP: 4,
  },
  EventRegistrationStatistic: {
    TOTAL_GROUP: 0,
    CANCEL_GROUP: 1,
    NOT_ATTENDED_GROUP: 2,
    ATTENDED_GROUP: 3,
    CONDITION_INSUFFICIENT_GROUP: 4,
  },
  BloodVolumeStatistic: {
    RECEIVED_GROUP: 1,
    EXPECTED_RECEIVE_GROUP: 2,
    RH_NEGATIVE: 3,
    RH_POSITIVE: 4,
  },
  BloodTypeStatistic: {
    UNKNOWN_GROUP: 0,
    A_GROUP: 1,
    B_GROUP: 2,
    AB_GROUP: 3,
    O_GROUP: 4,
  },
});
