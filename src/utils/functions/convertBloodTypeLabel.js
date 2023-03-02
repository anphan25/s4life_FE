export const convertBloodTypeLabel = (bloodTypeId, isRhNegative) => {
  switch (bloodTypeId) {
    case 1: {
      return `A${isRhNegative ? '-' : '+'}`;
    }
    case 2: {
      return `B${isRhNegative ? '-' : '+'}`;
    }
    case 3: {
      return `AB${isRhNegative ? '-' : '+'}`;
    }
    case 4: {
      return `O${isRhNegative ? '-' : '+'}`;
    }

    default: {
      return '-';
    }
  }
};
