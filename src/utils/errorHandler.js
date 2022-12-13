export function convertErrorCodeToMessage(code) {
  const message = {
    //Login
    1003: 'Quyền truy cập bị giới hạn',
    1004: 'Thông tin đăng nhập không chính xác',
    1005: 'Mật khẩu không chính xác',
    1008: 'Đổi mật khẩu thất bại',
    1009: 'Mật khẩu không hợp lệ',
    1034: 'Tài khoản đã bị vô hiệu',

    //Register
    2031: 'Bệnh viện không tồn tại',

    //Hospital
    3001: 'Tọa độ không chính xác',
    3002: 'Không tìm thấy vị trí',
    3003: 'Từ chối yêu cầu truy cập bệnh viện',
    3004: 'Không tìm thấy bệnh viện',
    3011: 'Bệnh viện đã bị vô hiệu',
    3021: 'Bệnh viện chưa bị vô hiệu',
    3031: 'Không thể vô hiệu, bệnh viện đang có sự kiện chưa kết thúc',

    //Event
    4001: 'Không thể tạo sự kiện hiến máu tuần này',
    4011: 'Thời gian sự kiện không hợp lệ',
    4002: 'Thiếu ngày bắt đầu và ngày kết thúc',
    4003: 'Sửa và hủy sự kiện phải trước ngày bắt đầu 3 ngày',
    4004: 'Sự kiện không tìm thấy',
    4005: 'Yêu cầu lọc không phù hợp',
    4009: 'Ngày bắt đầu không thể trước ngày kết thúc',
    4011: 'Thời gian sự kiện không hợp lệ',
    4013: 'Từ chối quyền truy cập sự kiện',
    4021: 'Sự kiện đã bị hủy hoặc đã kết thúc',
    4031: 'Không thể chỉnh sửa, sự kiện đã có người đăng ký',
    4041: 'Khu vực tổ chức sự kiện không hợp lệ',
    4051: 'Không nằm trong khung thời gian sự kiện',
    4061: 'Không sửa được sự kiện theo lịch làm việc của bệnh viện',
    4071: 'Thời gian bắt đầu và thời gian kết thúc phải cách nhau 1 giờ',

    //Blood Donation Approval

    //Blood Donation
    6003: 'Từ chối yêu cầu truy cập lịch sử hiến máu',
    6004: 'Không tìm thấy lịch sử hiến máu',

    //Event Registration
    7001: 'Bạn đã đăng ký sự kiện này rồi',
    7011: 'Phiếu đăng ký không hợp lệ',
    7021: 'Sự kiện không thể đăng ký, đã vượt quá sớ người tham gia',
    7031: 'Thiếu thông tin địa điểm đăng ký',
    7041: 'Trạng thái đăng ký không hợp lệ',
    7051: 'Phiếu đăng ký chỉ được điền từ 1 ngày trước khi sự kiện bắt đầu cho tới khi nó kết thúc',
    7061: 'Thiếu lý do hủy bỏ đăng ký hiến máu',
    7071: 'Thiếu thông tin phiếu đăng ký',
    7081: 'Thiếu số lượng máu hiến',
    7091: 'Sự kiện đã bắt đầu, không thể hủy đăng ký',
    7101: 'Thời gia dự kiến tham gia không hợp lệ',
    7003: 'Từ chối quyền truy cập thông tin đăng ký',
    7004: 'Không tìm thấy thông tin đăng ký ',
    7141: 'Từ chối yêu cầu cập nhật nhóm máu',

    //User Informations
    8000: 'Thay đổi thông tin cá nhân thành công',
    8001: 'Nhóm máu không hợp lệ',
    8011: 'Thông tin tình nguyện viên không hợp lệ',
    8003: 'Từ chối yêu cầu truy cập thông tin người dùng',
    8013: 'Yêu cầu cập nhật không phù hợp',
    8004: 'Không tìm thấy thông tin người dùng',
    8015: 'Cập nhật nhóm máu đang được xử lý',
    8016: 'Tình nguyện viên chưa hiến máu',
    8100: 'Cập nhật nhóm máu thành công',
  };
  return message[code];
}

export const errorHandler = (error) => {
  const { request, response } = error;

  if (response?.data?.code != null) {
    const { code } = response.data;
    var message = convertErrorCodeToMessage(code);
    return message;
  } else {
    switch (response?.status) {
      case 403:
        return 'Tài khoản không có quyền truy cập';

      default:
        return 'Đã có lỗi xảy ra trong quá trình xử lí';
    }
  }
};
