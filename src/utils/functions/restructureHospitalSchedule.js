// Move the Sunday with value 0 to the end of list
export const restructureHospitalSchedule = (schedule) => {
  if (!schedule) return;

  schedule?.sort((a, b) => a?.day - b?.day);
  const sunday = schedule?.find((el) => el.day === 0);

  const result = schedule?.filter((item) => item.day !== 0);

  result.push(sunday);

  return result;
};
