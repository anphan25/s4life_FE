export const EventRegistrationStatusEnum = Object.freeze({
  Registered: { description: 'Đã đăng ký', value: 2 },
  Present: { description: 'Đang có mặt', value: 5 },
  Donated: { description: 'Đã hiến máu', value: 3 },
  Cancelled: { description: 'Đã hủy đăng ký', value: 1 },
  ConditionInsufficient: { description: 'Không đủ sức khỏe', value: 4 },
  Missed: { description: 'Chưa được xác nhận', value: 8 },
  Discarded: { description: 'Bị hủy bỏ', value: 7 },
});
