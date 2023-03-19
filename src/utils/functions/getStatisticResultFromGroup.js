export const getStatisticResultFromGroup = (arr, groupNumber) => {
  if (!arr || groupNumber === null) return;

  return arr?.find((item) => item.group === groupNumber)?.result;
};
