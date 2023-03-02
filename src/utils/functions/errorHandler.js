import { PROCESSING_MESSAGE } from 'utils';

export function convertErrorCodeToMessage(code) {
  if (code === undefined || code === null) return;

  if (code < 0) return 'Đã có lỗi xảy ra trong quá trình xử lí';

  const message = {
    //Firebase
    10001: 'Tải ảnh thất bại, Vui lòng liên hệ quản trị viên',

    //Login
    1003: 'Quyền truy cập bị giới hạn',
    1004: 'Thông tin đăng nhập không chính xác',
    1005: 'Mật khẩu không chính xác',
    1008: 'Đổi mật khẩu thất bại',
    1009: 'Mật khẩu không hợp lệ',
    1034: 'Tài khoản đã bị vô hiệu',
    1100: 'Đổi mật khẩu thành công',

    //Register
    2001: 'Tên tài khoản đã tồn tại',
    2031: 'Bệnh viện không tồn tại',
    2100: 'Tạo tài khoản thành công',

    //Hospital
    3000: PROCESSING_MESSAGE,
    3100: 'Tạo bệnh viện thành công',
    3200: 'Chỉnh sửa thông tin bệnh viện thành công',
    3300: 'Vô hiệu bệnh viện thành công',
    3400: 'Kích hoạt bệnh viện thành công',
    3001: 'Tọa độ không chính xác',
    3002: 'Không tìm thấy vị trí',
    3003: 'Từ chối yêu cầu truy cập bệnh viện',
    3004: 'Không tìm thấy bệnh viện',
    3011: 'Bệnh viện đã bị vô hiệu',
    3021: 'Bệnh viện chưa bị vô hiệu',
    3031: 'Không thể vô hiệu, bệnh viện đang có sự kiện chưa kết thúc',

    //Event
    4000: PROCESSING_MESSAGE,
    4001: 'Không thể tạo sự kiện hiến máu tuần này',
    4002: 'Thiếu các thông tin cần thiết (*)',
    4003: 'Sửa và hủy sự kiện phải trước ngày bắt đầu 3 ngày',
    4004: 'Sự kiện không tìm thấy',
    4005: 'Yêu cầu lọc không phù hợp',
    4009: 'Ngày bắt đầu không thể trước ngày kết thúc',
    4011: 'Thời gian sự kiện không hợp lệ',
    4013: 'Từ chối yêu cầu truy cập sự kiện',
    4021: 'Sự kiện đã bị hủy hoặc đã kết thúc',
    4031: 'Không thể chỉnh sửa, sự kiện đã có người đăng ký',
    4041: 'Khu vực tổ chức sự kiện không hợp lệ',
    4051: 'Không nằm trong khung thời gian sự kiện',
    4061: 'Không sửa được sự kiện theo lịch làm việc của bệnh viện',
    4071: 'Không thể chỉnh sửa sự kiện khẩn cấp',
    4081: 'Sự kiện hiến máu khẩn cấp phải bao gồm nhóm máu cần',
    4091: 'Yêu cầu tạo sự kiện hiến máu không hợp lệ',
    4101: 'Thời gian bắt đầu và thời gian kết thúc phải cách nhau 1 giờ',
    4111: 'Sự kiện lưu động phải có khu vực di chuyển của xe',
    4121: 'Ngày kết thúc sự kiện hơn ngày bắt đầu sự kiện tối đa 30 ngày',
    4131: 'Chỉ được tạo sự kiện trong vòng 365 ngày kể từ ngày hiện tại',
    4141: 'Số lượng người tham gia tối thiểu phải bé hơn số lượng người tham gia tối đa',
    4151: 'Số lượng người tham gia tối thiểu ở sự kiện lưu động là 1',
    4100: 'Chỉnh sửa sự kiện thành công',
    4200: 'Hủy sự kiện thành công',
    4300: 'Tạo sự kiện thành công',

    //Blood Donation Approval
    5000: PROCESSING_MESSAGE,
    5001: 'Không thể trích xuất lịch sử hiến máu từ ảnh',
    5011: 'Thiếu trường thông tin ghi chú khi từ chối phê duyệt',
    5021: 'Yêu cầu này đã được xử lí',
    5003: 'Từ chối  yêu cầu truy cập',
    5004: 'Không tìm thấy yêu cầu',
    5031: 'Thông tin nhập lịch sử hiến máu không hợp lệ',
    5041: 'Thiếu thông tin lịch sử hiến máu',
    5051: 'Thông tin xét duyệt đã tồn tại trong hệ thống',
    5100: 'Tạo yêu cầu xét duyệt lịch sử hiến máu thành công',
    5200: 'Cập nhật yêu cầu xét duyệt lịch sử hiến máu thành công',
    //Blood Donation
    6000: PROCESSING_MESSAGE,
    6003: 'Từ chối yêu cầu truy cập lịch sử hiến máu',
    6004: 'Không tìm thấy lịch sử hiến máu',
    6100: 'Thêm lịch sử hiến máu thành công',

    //Event Registration
    7000: PROCESSING_MESSAGE,
    7001: 'Bạn đã đăng ký sự kiện này rồi',
    7003: 'Từ chối quyền truy cập thông tin đăng ký',
    7004: 'Không tìm thấy thông tin đăng ký ',
    7011: 'Phiếu đăng ký không hợp lệ',
    7021: 'Sự kiện không thể đăng ký, đã vượt quá sớ người tham gia',
    7031: 'Thiếu thông tin địa điểm đăng ký',
    7041: 'Trạng thái đăng ký không hợp lệ',
    7051: 'Phiếu đăng ký chỉ được điền từ 1 ngày trước khi sự kiện bắt đầu cho tới khi nó kết thúc',
    7061: 'Thiếu lý do hủy bỏ đăng ký hiến máu',
    7071: 'Thiếu thông tin phiếu đăng ký',
    7081: 'Thiếu số lượng máu hiến',
    7091: 'Sự kiện đã bắt đầu, không thể hủy đăng ký',
    7101: 'Thời gian dự kiến tham gia không hợp lệ',
    7111: 'Khoảng cách giữa 2 lần hiến máu gần nhất phải tối thiểu 90 ngày',
    7131: 'Nhóm máu của tình nguyện viên không nằm trong danh sách của sự kiện',
    7141: 'Từ chối yêu cầu cập nhật nhóm máu',
    7151: 'Tình nguyện viên không được đăng ký nhiều sự kiện cùng một lúc',
    7161: 'Không thể đăng ký vào sự kiện lưu động đang diễn ra',
    7171: 'Đã điền phiếu đăng kí tham gia hiến máu',
    7181: 'Vui lòng đến tham dự sự kiện hiến máu vào đúng ngày đã đăng kí tham gia',
    7100: 'Đăng kí sự kiện thành công',
    7200: 'Cập nhật thông tin đăng kí sự kiện thành công',
    7300: 'Hủy đăng kí sự kiện thành công',

    //User Informations
    8000: 'Thay đổi thông tin cá nhân thành công',
    8001: 'Nhóm máu không hợp lệ',
    8011: 'Thông tin tình nguyện viên không hợp lệ',
    8003: 'Từ chối yêu cầu truy cập thông tin người dùng',
    // 8013: 'Yêu cầu cập nhật không phù hợp',
    8004: 'Không tìm thấy thông tin người dùng',
    8014: 'Thời gian cập nhật nhóm máu tối đa là 3 ngày sau khi sự kiện kết thúc',
    8015: 'Cập nhật nhóm máu đang được xử lý',
    8016: 'Tình nguyện viên chưa hiến máu',
    8100: 'Cập nhật nhóm máu thành công',

    //Event Direction
    10003: 'Từ chối yêu cầu truy cập thông tin đường đi của sự kiện',
    10004: 'Không tìm thấy thông tin đường đi',

    //Blood Donation Approval Request
    110001: 'Thông tin lịch sử hiến máu không trùng khớp',
    110004: 'Không tìm thấy yêu cầu cập nhật lịch sử hiến máu',

    //Config number
    12000: 'Yêu cầu thay đổi hệ thống đang được xử lí',
    12100: 'Thay đổi cấu hình hệ thống thành công',
    //Internal Error
    5555: 'Có lỗi xảy ra, Vui lòng liên hệ quản trị viên',
  };
  return message[code];
}

export const errorHandler = (error) => {
  if (error?.response?.status === 401) return;
  const { response } = error;
  if (response?.data !== null) {
    const code = response?.data?.code;
    if (response?.status === 400 && !response?.data?.code) return 'Dữ liệu truyền vào không hợp lệ';
    if (code < 0) return 'Đã có lỗi xảy ra trong quá trình xử lí';

    var message = convertErrorCodeToMessage(code);
    return message;
  } else {
    switch (response?.status) {
      case 403:
        return 'Tài khoản không có quyền truy cập';

      case 500:
        return 'Đã có lỗi xảy ra, Vui lòng liên hệ quản trị viên.';

      default:
        return 'Đã có lỗi xảy ra trong quá trình xử lí';
    }
  }
};
