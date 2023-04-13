export const getEnumDescriptionByValue = (ENUM, value) => {
  return ENUM[Object.keys(ENUM).find((key) => ENUM[key].value === value)]?.description;
};
