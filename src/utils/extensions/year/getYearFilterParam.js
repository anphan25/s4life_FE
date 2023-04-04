export const getYearFilterParam = (year) => {
  return { DateStart: `${year}-1-1`, DateEnd: `${year}-12-31` };
};
