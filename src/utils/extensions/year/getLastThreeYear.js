export const getLastThreeYear = (currentYear) => {
  const years = [];

  for (let i = 0; i < 3; i++) {
    const year = currentYear - i;
    years.push(year);
  }
  return years;
};
