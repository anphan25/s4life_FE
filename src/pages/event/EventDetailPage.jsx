import React, { useState, useEffect } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { FcCancel } from 'react-icons/fc';
import { VscCalendar } from 'react-icons/vsc';
import { MdOutlineWaterDrop, MdOutlineLocationOn } from 'react-icons/md';
import { Stack, styled, Grid, Box, Paper, Typography, Divider, Menu, MenuItem, IconButton, Chip } from '@mui/material';
import { BsThreeDots } from 'react-icons/bs';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { HeaderBreadcumbs, DataTable, FilterTab, FromToDateFilter, SearchBar } from 'components';
import { formatDate } from 'utils/formatDate';
import moment from 'moment';
import { getEventDetailByEventId } from 'api/EventApi';
import { getEventRegistrations } from 'api/EventRegistrationApi';
import { useParams } from 'react-router-dom';
import { DEFAULT_EVENT_URL, MAX_INT, convertBloodTypeNeedLabel } from 'utils';
import parse from 'html-react-parser';

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
    maxHeight: '500px',
    margin: '0 auto',
    borderRadius: '20px',
  },
}));

const TitleItemStyle = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
}));

const FilterSectionStyle = styled(Box)(({ theme }) => ({
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

const InputFilterSectionStyle = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  margin: '20px',
  gap: 10,

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
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

const EventMenuOptions = [
  { label: 'Chỉnh sửa', icon: <AiFillEdit /> },
  { label: 'Hủy', icon: <FcCancel /> },
];

const filterTabValues = [
  { label: 'Chưa tham gia', value: 2 },
  { label: 'Đã tham gia', value: 3 },
  { label: 'Đã hủy đăng ký', value: 1 },
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
  const [detailData, setDetailData] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const { eventId } = useParams();
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
    status: 2, //Cancelled = 1 ,NotYetAttended = 2, Attended = 3,
    searchPhoneNumber: '',
    dateFrom: null,
    dateTo: null,
  });

  const StatusTagStyle = styled(Chip)(({ theme }) => ({
    borderRadius: '8px',
    marginBottom: '15px',
    padding: '8px 10px',
    fontWeight: 'bold',
    fontSize: '15px',
    backgroundColor: theme.palette[`${TagStyleConvert(detailData?.status)}`]?.light,
    color: theme.palette[`${TagStyleConvert(detailData?.status)}`]?.main,
  }));

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
        field: 'fullName',
        type: 'string',
        minWidth: 150,
        flex: 1,
      },

      {
        headerName: 'CMND/CCCD',
        field: 'nationalId',
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
        headerName: 'Ngày tham gia',
        field: 'participationDate',
        type: 'string',
        width: 200,
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

  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, status: value, page: 1 }));
  };

  const handleFromToDateFilter = (params) => {
    setPageState((old) => ({ ...old, page: 1, dateFrom: params.startDate, dateTo: params.endDate }));
  };

  const handleSearchVolunteerPhoneNumber = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchPhoneNumber: searchValue.searchTerm }));
  };

  const fetchEventDetailData = async () => {
    const data = await getEventDetailByEventId(eventId);
    setDetailData(data);
  };

  const fetchVolunteersOfEvent = async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));

    const data = await getEventRegistrations({
      EventId: eventId,
      Status: pageState.status,
      Page: pageState.page,
      PageSize: pageState.pageSize,
      SearchPhoneNumber: pageState.searchKey,
      DateFrom: pageState?.dateFrom
        ? moment(pageState?.dateFrom?.toISOString()).utc().local().format('yyyy-MM-DD')
        : '',
      DateTo: pageState?.dateTo ? moment(pageState?.dateTo?.toISOString()).utc().local().format('yyyy-MM-DD') : '',
    });

    const dataRow = data.items?.map((data, i) => ({
      no: i + 1,
      id: data.id,
      fullName: data.fullName || '-',
      nationalId: data.nationalId || '-',
      phoneNumber: data.phoneNumber || '-',
      bloodType: data.bloodType === 'Chưa biết' ? '-' : data.bloodType || '-',
      participationDate: formatDate(data.participationDate, 2) || '-',
    }));
    setPageState({ ...pageState, isLoading: false, data: dataRow, total: data.total });
  };

  useEffect(() => {
    try {
      fetchEventDetailData();
    } catch (err) {}
  }, []);

  useEffect(() => {
    try {
      fetchVolunteersOfEvent();
    } catch (err) {}
  }, [
    pageState.page,
    pageState.pageSize,
    pageState.status,
    pageState.dateFrom,
    pageState.dateTo,
    pageState.searchPhoneNumber,
  ]);

  return (
    <Box>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Chi tiết sự kiện"
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Danh sách sự kiện cố định', to: '/event/list/' },
            { name: `${detailData?.name}` },
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
                  width: '20ch',
                },
              }}
            >
              {EventMenuOptions.map((option) => (
                <MenuItem
                  key={option}
                  onClick={handleClose}
                  disabled={!isEventEditableOrCancelable(detailData?.status, detailData?.numberOfRegistration)}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    {option.icon} <Typography>{option.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Menu>
          </Stack>

          <EventImageStyle>
            <img
              className="event-img"
              src={detailData?.eventImages[0].imageUrl || DEFAULT_EVENT_URL}
              alt="Ảnh sự kiện"
            />
          </EventImageStyle>

          <Box>
            <Typography
              sx={{
                fontSize: '35px',
                fontWeight: 'bold',
                wordBreak: 'break-all',
              }}
            >
              {detailData?.name}
            </Typography>

            <StatusTagStyle label={detailData?.status} />

            <Typography>{parse(`${detailData?.description}`)}</Typography>
          </Box>

          <Grid rowSpacing={2} container>
            <InfoItemWithIconStyle lg={6} xs={12} item>
              <Stack className="info-item">
                <Box className="info-item_icon">
                  <MdOutlineLocationOn className="info-item_icon_item" />
                </Box>
                <Box>
                  <Typography className="info-item_title">{detailData?.eventLocations[0].location.name}</Typography>
                  <Typography>{detailData?.eventLocations[0].location.address}</Typography>
                </Box>
              </Stack>
            </InfoItemWithIconStyle>

            <InfoItemWithIconStyle lg={6} xs={12} item>
              <Stack className="info-item">
                <Box className="info-item_icon">
                  <VscCalendar className="info-item_icon_item" />
                </Box>
                <Box>
                  <Typography className="info-item_title">{`${formatDate(detailData?.startDate, 3)} - ${formatDate(
                    detailData?.endDate,
                    3
                  )}`}</Typography>
                  <Typography>{`${moment(detailData?.workingTimeStart, 'HH:mm').format('HH:mm')} - ${moment(
                    detailData?.workingTimeEnd,
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
                  <Typography className="info-item_title">
                    {detailData?.bloodTypeNeed
                      ? detailData?.bloodTypeNeed.map((e) => (
                          <Chip
                            label={convertBloodTypeNeedLabel(e.bloodType, e.isRhNegative)}
                            sx={{ marginLeft: '5px' }}
                            variant="contained"
                            color="primary"
                          />
                        ))
                      : 'Tất cả nhóm máu'}
                  </Typography>
                  <Typography>Nhóm máu cần lấy</Typography>
                </Box>
              </Stack>
            </InfoItemWithIconStyle>

            <InfoItemWithIconStyle lg={6} xs={12} item>
              <Stack className="info-item">
                <Box className="info-item_avt">
                  <img src={detailData?.hospital.avatarUrl} alt="ảnh đại diện" />
                </Box>
                <Box>
                  <Typography className="info-item_title">{detailData?.hospital.name}</Typography>
                  <Typography>Đơn vị tổ chức</Typography>
                </Box>
              </Stack>
            </InfoItemWithIconStyle>
          </Grid>

          <Grid rowSpacing={3} container>
            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Liên hệ:</TitleItemStyle> {detailData?.contactInformation}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Mã sự kiện:</TitleItemStyle> {detailData?.eventCode}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Loại sự kiện:</TitleItemStyle> {detailData?.eventType}
              </Typography>
            </Grid>

            {detailData?.maxParticipant === MAX_INT ? (
              ''
            ) : (
              <Grid md={4} sm={6} xs={12} item>
                <Typography>
                  <TitleItemStyle>Số người đăng ký tối đa:</TitleItemStyle> {detailData?.maxParticipant}
                </Typography>
              </Grid>
            )}

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Số người đăng ký hiện tại:</TitleItemStyle> {detailData?.numberOfRegistration}
              </Typography>
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ margin: '30px 0 30px' }} />

        {/* Volunteer of event */}
        <Box>
          <Typography variant="h4" sx={{ marginBottom: '10px' }}>
            Danh sách người đăng ký
          </Typography>
          <Paper elevation={1} sx={{ borderRadius: '20px' }}>
            <FilterSectionStyle>
              <FilterTab
                sx={{
                  padding: '10px 20px 0',
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                  backgroundColor: '#F4F6F8',
                }}
                tabs={filterTabValues}
                onChangeTab={handleFilterTabChange}
                defaultValue={pageState.status}
              />

              <InputFilterSectionStyle>
                <FromToDateFilter onChange={handleFromToDateFilter} sx={{ width: '50%' }} />
                <SearchBar
                  sx={{ width: '50%' }}
                  className="search-bar"
                  placeholder="Nhập số điện thoại..."
                  onSubmit={handleSearchVolunteerPhoneNumber}
                />
              </InputFilterSectionStyle>
            </FilterSectionStyle>
            <DataTable
              gridOptions={gridOptions}
              onPageChange={pageChangeHandler}
              onPageSizeChange={pageSizeChangeHandler}
              disableFilter={true}
            />
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default EventDetailPage;
