export const formatPhoneNumber = (phoneNumber) => {
  const formattedPhoneNumber = phoneNumber.replaceAll('+84', '0');
  return formattedPhoneNumber;
};
