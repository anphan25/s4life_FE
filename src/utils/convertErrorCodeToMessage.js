export function convertErrorCodeToMessage(code) {
  const message = {
    //Hospital
    3001: 'Tọa độ không chính xác',
    3002: 'Không tìm thấy vị trí',
    3003: 'Từ chối yêu cầu truy cập bệnh viện',
    3004: 'Không tìm thấy bệnh viện',

    //Event
    4001: 'Không thể tạo sự kiện hiến máu tuần này',
    4011: 'Thời gian sự kiện không hợp lệ',
    4002: 'Thiếu ngày bắt đầu và ngày kết thúc',
    4003: 'Sửa và hủy sự kiện phải trước ngày bắt đầu 3 ngày',
    4004: 'Sự kiện không tìm thấy',

    //Blood Donation
    6003: 'Từ chối yêu cầu truy cập lịch sử hiến máu',
    6004: 'Không tìm thấy lịch sử hiến máu',
  };
  return message[code];
}
