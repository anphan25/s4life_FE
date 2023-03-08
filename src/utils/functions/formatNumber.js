export function formatNumber(number) {
  if (number === null || number === undefined) return '-';
  return new Intl.NumberFormat('vi-VN').format(number);
}
