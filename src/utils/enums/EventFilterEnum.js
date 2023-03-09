export const EventFilterEnum = Object.freeze({
  All: 1,
  FilterAndSearch: 2, //sẽ không quan tâm field EventRegisterable
  EventRegisterable: 3, //sẽ ko quan tâm field status
  MostRecent: 4,
  NonMobileEvent: 5,
});
