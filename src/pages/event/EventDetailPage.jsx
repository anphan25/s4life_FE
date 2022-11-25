import React, { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { FcCancel } from 'react-icons/fc';
import { VscCalendar } from 'react-icons/vsc';
import { MdOutlineWaterDrop, MdOutlineLocationOn } from 'react-icons/md';
import {
  Stack,
  styled,
  Grid,
  Box,
  Button,
  Paper,
  Typography,
  Divider,
  Menu,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import { BsThreeDots } from 'react-icons/bs';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { HeaderBreadcumbs, DataTable } from 'components';
import { formatDate } from 'utils/formatDate';
import moment from 'moment';

const HeaderMainStyle = styled(Stack)(({ theme }) => ({
  marginBottom: '20px',
  justifyContent: 'space-between',

  flexDirection: 'row',

  [theme.breakpoints.up('sm')]: {
    alignItems: 'center',
  },

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    justifyContent: 'start',
    gap: '20px',
  },
}));

const EventImageStyle = styled(Box)(({ theme }) => ({
  '& .event-img': {
    width: '100%',
    height: 'auto',
    maxHeight: '450px',
    margin: '0 auto',
    borderRadius: '20px',
    // border: '1px solid #F4F4F4',
  },
}));

const TitleItemStyle = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
}));

const TagStyleConvert = (status, theme) => {
  switch (status) {
    case 'Chưa bắt đầu': {
      return 'warning';
    }
    case 'Đã bắt đầu': {
      return 'success';
    }
    case 'Đã kết thúc': {
      return 'info';
    }
    case 'Đã bị hủy': {
      return 'error';
    }

    default: {
    }
  }
};

const InfoItemWithIconStyle = styled(Grid)(({ theme }) => ({
  '& .info-item': { flexDirection: 'row', gap: '15px' },

  '& .info-item_icon': {
    width: '50px',
    height: '50px',
    borderRadius: '100%',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.error.light,
    padding: '10px',
  },

  '& .info-item_avt': {
    width: '50px',
    height: '50px',

    '& img': { width: '100%', height: '100%', objectFit: 'cover' },
  },

  '& .info-item_icon_item': { width: '100%', height: '100%' },

  '& .info-item_title': { fontWeight: 'bold', marginBottom: '5px' },
}));

const dummyData = {
  numberOfRegistration: 0,
  id: '7a54ca29-10f8-4c10-a2c7-4aecc77438df',
  name: 'Lấy máu khẩn cấp báchhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
  description:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis consequuntur, adipisci, praesentium, alias delectus nihil et quo laborum nobis tenetur dolorum quas atque saepe omnis placeat ea dicta non commodi. Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, sequi exercitationem corporis ad earum reprehenderit quisquam maxime adipisci, nostrum, aut fugit recusandae animi ea nobis pariatur rem sint perspiciatis obcaecati?. Lorem, Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptate quidem fuga vel obcaecati iusto, quo minima, ad quasi nemo odit sit in error ex debitis excepturi illo? Eaque, esse dignissimos!',
  eventCode: 'test003',
  eventType: 'Sự kiện cố định',
  eventTypeId: 1,
  area: null,
  hospitalId: 5,
  startDate: '2022-12-02T00:00:00',
  workingTimeStart: '07:30:00',
  endDate: '2022-12-02T00:00:00',
  workingTimeEnd: '17:30:00',
  eventLocations: [
    {
      id: 'ba6b618e-4f01-4afd-9acc-2fe33d1b61b7',
      eventId: '7a54ca29-10f8-4c10-a2c7-4aecc77438df',
      event: null,
      locationId: '9bd7e609-9dd6-4da8-ad98-bb1b7e556649',
      location: {
        id: '9bd7e609-9dd6-4da8-ad98-bb1b7e556649',
        name: 'Bệnh viện Chợ Rẫy',
        address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, Thành phố Hồ Chí Minh',
        wardId: 27310,
        districtId: 774,
        provinceId: 79,
        latitude: '10.7576886',
        longitude: '106.6573655',
        eventLocations: null,
      },
    },
  ],
  contactInformation: '02838554137',
  bloodTypeNeed: 'Nhóm máu O',
  minParticipant: 1,
  maxParticipant: 50,
  status: 'Đã bị hủy',
  addDate: '2022-11-24T11:55:05.2853638Z',
  addUser: 'manager1',
  editDate: null,
  editUser: null,
  isCancelled: false,
  eventImages: [
    {
      id: '4484fa7e-22ef-47ed-976c-81f4f76ea1d1',
      eventId: '7a54ca29-10f8-4c10-a2c7-4aecc77438df',
      event: null,
      imageUrl:
        'https://scontent.fsgn5-6.fna.fbcdn.net/v/t39.30808-6/306553062_600501074853584_40290124352598590_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=e3f864&_nc_ohc=b8VoujFhznsAX-pwhyW&_nc_ht=scontent.fsgn5-6.fna&oh=00_AfApp8kJQ3zoZplAjkLw4zTPX4to62NYg4hrgs9yIg3IMA&oe=638397E5',
    },
  ],
};

const EventMenuOptions = [
  { label: 'Chỉnh sửa', icon: <AiFillEdit /> },
  { label: 'Hủy', icon: <FcCancel /> },
];

const isEventEditableOrCancelable = (status, numberOfRegistration) => {
  if (status === 'Đã kết thúc' || status === 'Đã bị hủy') {
    return false;
  }

  if (numberOfRegistration > 0) {
    return false;
  }

  return true;
};

const EventDetailPage = () => {
  const [detailData, setDetailData] = useState(dummyData);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,

    dateTo: null,
  });

  const gridOptions = {
    columns: [
      {
        headerName: 'No',
        field: 'no',
        width: 10,
        align: 'center',
      },
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Tên',
        field: 'name',
        type: 'string',
        minWidth: 150,
        flex: 1,
      },
      {
        headerName: 'CMND/CCCD',
        field: 'idNumber',
        type: 'string',
        width: 200,
      },
      {
        headerName: 'Số điện thoại',
        field: 'phoneNumber',
        type: 'string',
        width: 170,
      },
      {
        headerName: 'Nhóm máu',
        field: 'bloodType',
        type: 'string',
        width: 100,
      },
      {
        headerName: 'Trạng thái',
        field: 'status',
        type: 'string',
        width: 150,
      },
      {
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,
        getActions: (params) => [
          <GridActionsCellItem
            icon={
              <Box sx={{ '& .action-icon': { color: '#FFC700' } }}>
                <AiFillEdit className="action-icon" />
              </Box>
            }
            onClick={() => {}}
            label="Cập nhật nhóm máu"
            showInMenu
          />,
        ],
      },
    ],
    pageState: pageState,
  };

  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };

  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, pageSize: newPageSize }));
  };

  const StatusTagStyle = styled(Chip)(({ theme }) => ({
    borderRadius: '8px',
    marginBottom: '10px',
    padding: '8px 10px',
    fontWeight: 'bold',
    fontSize: '15px',
    backgroundColor: theme.palette[`${TagStyleConvert(detailData.status)}`].light,
    color: theme.palette[`${TagStyleConvert(detailData.status)}`].main,
  }));

  return (
    <Box>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Chi tiết sự kiện"
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Danh sách sự kiện', to: '/event/list/' },
            { name: `${detailData.name}` },
          ]}
        />
      </HeaderMainStyle>

      <Paper elevation={1} sx={{ padding: '30px', borderRadius: '20px' }}>
        <Stack spacing={2}>
          <Stack justifyContent="flex-end">
            <IconButton
              sx={{ marginLeft: 'auto', width: '40px' }}
              // aria-label="more"
              id="long-button"
              aria-controls={open ? 'long-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <BsThreeDots />
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                style: {
                  // maxHeight: ITEM_HEIGHT * 4.5,
                  width: '20ch',
                },
              }}
            >
              {EventMenuOptions.map((option) => (
                <MenuItem
                  key={option}
                  // selected={option === 'Pyxis'}
                  onClick={handleClose}
                  disabled={!isEventEditableOrCancelable(detailData?.status, detailData.numberOfRegistration)}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    {option.icon} <Typography>{option.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Menu>
          </Stack>

          <EventImageStyle>
            <img className="event-img" src={detailData.eventImages[0].imageUrl} alt="Ảnh sự kiện" />
          </EventImageStyle>

          <Box>
            <Typography
              sx={{
                fontSize: '35px',
                fontWeight: 'bold',
                wordBreak: 'break-all',
              }}
            >
              {detailData.name}
            </Typography>

            <StatusTagStyle label={detailData.status} />

            <Typography sx={{ color: '#7E808A' }}>{detailData.description}</Typography>
          </Box>

          <Grid rowSpacing={2} container>
            <InfoItemWithIconStyle lg={6} xs={12} item>
              <Stack className="info-item">
                <Box className="info-item_icon">
                  <MdOutlineLocationOn className="info-item_icon_item" />
                </Box>
                <Box>
                  <Typography className="info-item_title">{detailData.eventLocations[0].location.name}</Typography>
                  <Typography>{detailData.eventLocations[0].location.address}</Typography>
                </Box>
              </Stack>
            </InfoItemWithIconStyle>

            <InfoItemWithIconStyle lg={6} xs={12} item>
              <Stack className="info-item">
                <Box className="info-item_icon">
                  <VscCalendar className="info-item_icon_item" />
                </Box>
                <Box>
                  <Typography className="info-item_title">{`${formatDate(detailData.startDate, 3)} - ${formatDate(
                    detailData.endDate,
                    3
                  )}`}</Typography>
                  <Typography>{`${moment(detailData.workingTimeStart, 'HH:mm').format('HH:mm')} - ${moment(
                    detailData.workingTimeEnd,
                    'HH:mm'
                  ).format('HH:mm')} `}</Typography>
                </Box>
              </Stack>
            </InfoItemWithIconStyle>

            <InfoItemWithIconStyle lg={6} xs={12} item>
              <Stack className="info-item">
                <Box className="info-item_icon">
                  <MdOutlineWaterDrop className="info-item_icon_item" />
                </Box>
                <Box>
                  <Typography className="info-item_title">{detailData.bloodTypeNeed}</Typography>
                  <Typography>Nhóm máu cần lấy</Typography>
                </Box>
              </Stack>
            </InfoItemWithIconStyle>

            <InfoItemWithIconStyle lg={6} xs={12} item>
              <Stack className="info-item">
                <Box className="info-item_avt">
                  <img
                    src="https://play-lh.googleusercontent.com/LJsqYrfyf-cxEo6rODvn2DxC-lKIUElbK2zR3mL0uDC8Exz0Xw1Nzdzu-M2Ek5LLotrO"
                    alt="ảnh đại diện"
                  />
                </Box>
                <Box>
                  <Typography className="info-item_title">Bệnh viện Long An</Typography>
                  <Typography>Đơn vị tổ chức</Typography>
                </Box>
              </Stack>
            </InfoItemWithIconStyle>
          </Grid>

          <Grid rowSpacing={3} container>
            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Liên hệ:</TitleItemStyle> {detailData.contactInformation}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Mã sự kiện:</TitleItemStyle> {detailData.eventCode}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Loại sự kiện:</TitleItemStyle> {detailData.eventType}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Số người đăng ký tối thiểu:</TitleItemStyle> {detailData.minParticipant}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Số người đăng ký tối đa:</TitleItemStyle> {detailData.maxParticipant}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Số người đăng ký hiện tại:</TitleItemStyle> {detailData.numberOfRegistration}
              </Typography>
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ margin: '30px 0 30px' }} />

        {/* Volunteer of event */}
        <Box>
          <Typography variant="h4" sx={{ marginBottom: '10px' }}>
            Danh sách người tham gia
          </Typography>
          <DataTable
            gridOptions={gridOptions}
            onPageChange={pageChangeHandler}
            onPageSizeChange={pageSizeChangeHandler}
            disableFilter={true}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default EventDetailPage;
