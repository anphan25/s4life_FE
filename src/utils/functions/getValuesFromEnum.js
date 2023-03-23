export const getValuesFromEnum = (ENUM) => {
  return Object.keys(ENUM).map((key) => ({
    label: ENUM[key].description,
    value: ENUM[key].value,
  }));
};
