export const groupDataByErrorCode = (failedList) => {
  if (!failedList) return;

  const groupBErrorCode = failedList.reduce((acc, obj) => {
    const key = obj.errorCode;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj.data);
    return acc;
  }, []);

  return groupBErrorCode;
};
