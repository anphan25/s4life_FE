export const getStatisticResultFromGroup = (arr, groupNumber) => {
  if (!arr || groupNumber === null || arr?.length <= 0) return 0;

  return arr?.find((item) => item.group === groupNumber)?.result;
};
