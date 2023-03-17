import { BloodTypeFilterEnum } from 'utils';

export const getFilterBloodTypeLabels = () => {
  const result = [];
  for (const property in BloodTypeFilterEnum) {
    result.push(BloodTypeFilterEnum[property].label);
  }

  return result;
};
