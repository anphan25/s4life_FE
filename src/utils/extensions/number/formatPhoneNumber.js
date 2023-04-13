export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return;
  const formattedPhoneNumber = phoneNumber?.replaceAll('+84', '0');
  return formattedPhoneNumber;
};
