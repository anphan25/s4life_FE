export const getLabelFromEventStatus = (status) => {
  switch (status) {
    case 1:
      return 'warning';
    case 2:
      return 'info';
    case 3:
      return 'success';
    case 4:
      return 'error';
    default:
      return;
  }
};
