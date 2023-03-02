export function getVietnameseRole(role) {
  const VnRole = {
    Admin: 'Quản trị viên',
    Manager: 'Quản lý',
    Staff: 'Nhân viên',
  };
  return VnRole[role];
}
