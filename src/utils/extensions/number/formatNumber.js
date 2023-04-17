export function formatNumber(number) {
  if (number === null || number === undefined) return 0;
  return new Intl.NumberFormat('vi-VN').format(number);
}
