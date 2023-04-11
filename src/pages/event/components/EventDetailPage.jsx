import React, { useState, useEffect, useCallback } from 'react';
import {
  Stack,
  styled,
  Grid,
  Box,
  Typography,
  Divider,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  DialogActions,
  Button,
  Skeleton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { HeaderBreadcumbs, CustomDialog, Icon } from 'components';
import moment from 'moment';
import { getEventDetailByEventId, cancelEvent } from 'api/EventApi';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DEFAULT_EVENT_IMAGE_URL,
  MAX_INT,
  convertBloodTypeLabel,
  errorHandler,
  formatDate,
  isEventEditable,
  convertErrorCodeToMessage,
  isStartAndEndDateIsSame,
  EventTypeEnum,
  RoleEnum,
  EventStatusEnum,
} from 'utils';
import parse from 'html-react-parser';
import VolunteerListOfEvent from './VolunteerListOfEvent';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSelector } from 'react-redux';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useSnackbar } from 'notistack';
import { NotFoundIcon } from 'assets';

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
    borderRadius: '100%',

    '& img': { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '100%' },
  },

  '& .info-item_icon_item': { width: '100%', height: '100%' },

  '& .info-item_title': { fontWeight: 'bold', marginBottom: '5px' },
}));

const DialogButtonGroup = styled(DialogActions)(({ theme }) => ({
  marginTop: 'auto',
  padding: '10px 0px 10px !important',

  [theme.breakpoints.down('sm')]: {
    margin: '0 auto',
    '& .dialog_button': {
      fontSize: '10px',
    },
  },
}));

const EventDetailPage = () => {
  const [detailData, setDetailData] = useState(null);
  const [cancelEventId, setCancelEventId] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { eventId } = useParams();
  const [isCancelEventOpen, setIsCancelEventOpen] = useState(false);
  const [isEditCancelAlertOpen, setIsEditCancelAlertOpen] = useState(false);
  const [isHospitalScheduleEvent, setIsHospitalScheduleEvent] = useState(false);
  const [registrationAreas, setRegistrationAreas] = useState([]);
  const [isRegistrationAreaOpen, setIsRegistrationAreaOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState([]);
  const [connection, setConnection] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  let user = useSelector((state) => state.auth.auth?.user);
  const store = useStore();
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  }));

  function CustomNoRowsOverlay() {
    return (
      <StyledGridOverlay>
        <NotFoundIcon height={200} width={200} />
        <Typography fontSize={14} fontWeight={500} sx={{ mt: 1 }}>
          Không tìm thấy dữ liệu
        </Typography>
      </StyledGridOverlay>
    );
  }

  const isAdmin = user.role === RoleEnum.Admin.name;
  const isManager = user.role === RoleEnum.Manager.name;

  const StatusTagStyle = styled(Chip)(({ theme }) => ({
    borderRadius: '8px',
    height: 'auto',
    marginBottom: '15px',
    padding: '4px 6px',
    fontWeight: 'bold',
    fontSize: '12px',
    backgroundColor: theme.palette[`${TagStyleConvert(detailData?.status)}`]?.light,
    color: theme.palette[`${TagStyleConvert(detailData?.status)}`]?.main,
  }));

  const EmergencyTagStyle = styled(Chip)(({ theme }) => ({
    borderRadius: '8px',
    height: 'auto',
    marginBottom: '15px',
    marginLeft: '10px',
    padding: '4px 6px',
    fontWeight: 'bold',
    fontSize: '12px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.grey[100],
  }));

  const EventImageStyle = styled(Box)(({ theme }) => ({
    width: '100%',
    height: 'auto',
    maxHeight: '500px',

    '& .event-img': {
      objectFit: isHospitalScheduleEvent ? 'contain' : 'cover',
      width: '100%',
      height: 'auto',
      maxHeight: '500px',
      margin: '0 auto',
      borderRadius: '20px',
    },
  }));

  const handleCancelEventDialog = () => {
    setIsCancelEventOpen(!isCancelEventOpen);
  };

  const handleEditCancelDialog = () => {
    setIsEditCancelAlertOpen(!isEditCancelAlertOpen);
  };

  const handleRegistrationAreaDialog = () => {
    setIsRegistrationAreaOpen(!isRegistrationAreaOpen);
  };

  const eventListNavigator = (eventTypeId) => {
    switch (eventTypeId) {
      case EventTypeEnum.PermanentScheduledEvent: {
        return { label: 'Danh sách sự kiện cố định theo lịch bệnh viện', link: '/event/schedule-list/' };
      }
      case EventTypeEnum.PermanentEvent: {
        return { label: 'Danh sách sự kiện cố định', link: '/event/fixed-list/' };
      }
      case EventTypeEnum.MobileEvent: {
        return { label: 'Danh sách sự kiện lưu động', link: '/event/mobile-list/' };
      }
      case EventTypeEnum.IntendedEvent: {
        return { label: 'Danh sách sự kiện lưu động dự kiến', link: '/event/intended-list/' };
      }
      default: {
        return '-';
      }
    }
  };

  const cancelEventDialogContent = () => {
    return (
      <Box>
        <Typography>Bạn có chắc chắn muốn hủy sự kiện này không ?</Typography>
        <DialogButtonGroup sx={{ marginTop: '10px' }}>
          <Button onClick={handleCancelEventDialog}>Hủy</Button>
          <LoadingButton
            loading={isButtonLoading}
            onClick={async () => {
              setIsButtonLoading(true);
              try {
                await cancelEvent(cancelEventId);
                await fetchEventDetailData();
              } catch (error) {
                enqueueSnackbar(errorHandler(error), {
                  variant: 'error',
                  persist: false,
                });
              } finally {
                handleCancelEventDialog();
                setIsButtonLoading(false);
              }
            }}
            variant="contained"
            autoFocus
          >
            Ok
          </LoadingButton>
        </DialogButtonGroup>
      </Box>
    );
  };

  const alertEditCancelDialogContent = () => {
    return (
      <Box>
        <>
          <Typography>
            Chỉ được chỉnh sửa sự kiện trước 3 ngày sự kiện bắt đầu và sự kiện không có tình nguyện viên đăng ký.
          </Typography>
        </>

        <DialogButtonGroup sx={{ marginTop: '10px' }}>
          <Button
            variant="contained"
            onClick={() => {
              handleEditCancelDialog();
            }}
          >
            Ok
          </Button>
        </DialogButtonGroup>
      </Box>
    );
  };

  const registrationAreaDialogContent = () => {
    return (
      <Box>
        <Typography mb={2}>
          Số lượng đăng ký của <b>{detailData?.intendedProvince?.name}</b>:
        </Typography>
        <Box>
          <DataGrid
            disableColumnMenu
            sx={{
              minHeight: 500,
              maxHeight: '70vh',
              '.MuiPopper-root': {
                boxShadow: '0px 12px 23px rgba(62, 73, 84, 0.04) !important',
                borderRadius: 12,
                padding: '12px',
              },
            }}
            rows={registrationAreas}
            columns={[
              { field: 'id', hide: true },
              { field: 'districtName', headerName: 'Quận huyện', flex: 1, minWidth: 200, type: 'string' },
              { field: 'count', headerName: 'Số người đăng ký', width: 150, type: 'number', align: 'right' },
            ]}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            components={{
              NoRowsOverlay: CustomNoRowsOverlay,
            }}
            onSelectionModelChange={(ids) => {
              const selectedIDs = new Set(ids);
              const selectedRows = registrationAreas?.filter((row) => selectedIDs.has(row?.id));
              console.log('selectedRows', selectedRows);
              setSelectedDistrict(selectedRows);
            }}
          />
        </Box>

        <DialogButtonGroup sx={{ marginTop: '10px' }}>
          <Button
            disabled={selectedDistrict.length <= 0}
            variant="contained"
            onClick={() => {
              navigate('/event/mobile-list/add', {
                state: {
                  province: { id: detailData?.intendedProvince?.id, name: detailData?.intendedProvince?.name },
                  selectedDistricts: selectedDistrict?.map((district) => ({
                    id: district?.districtId,
                    name: district?.districtName,
                  })),
                  totalRegistrations: selectedDistrict?.reduce((acc, current) => acc + current?.count, 0),
                  contactInformation: detailData?.contactInformation,
                  intendedStartDate: detailData?.startDate,
                  intendedEndDate: detailData?.endDate,
                  minParticipant: detailData?.minParticipant,
                  maxParticipant: detailData?.maxParticipant,
                  intendedEventId: detailData?.id,
                },
              });
            }}
          >
            Tiến hành tạo sự kiện lưu động
          </Button>
        </DialogButtonGroup>
      </Box>
    );
  };

  const fetchEventDetailData = useCallback(async () => {
    try {
      const data = await getEventDetailByEventId(eventId);
      setIsHospitalScheduleEvent(data?.eventTypeId === EventTypeEnum.PermanentScheduledEvent);

      // Only intended events have registrationAreas
      if (data?.eventTypeId === EventTypeEnum.IntendedEvent) {
        const registrationAreaList = Object.values(data?.registrationAreas);

        setRegistrationAreas(registrationAreaList?.map((item) => ({ ...item, id: item?.districtId })));
      }

      setDetailData(data);
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    }
  }, [eventId]);

  useEffect(() => {
    setCancelEventId(eventId);
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHub(connection, (messageCode) => {
      enqueueSnackbar(convertErrorCodeToMessage(messageCode), {
        variant: messageCode < 0 ? 'error' : 'success',
        persist: false,
      });
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  useEffect(() => {
    fetchEventDetailData();
  }, [fetchEventDetailData]);

  return (
    <Box>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Chi tiết sự kiện"
          links={[
            { name: 'Trang chủ', to: '/' },
            {
              name: eventListNavigator(detailData?.eventTypeId)?.label || '-',
              to: eventListNavigator(detailData?.eventTypeId)?.link || '-',
            },
            { name: `${detailData?.name || '-'}` },
          ]}
        />
      </HeaderMainStyle>

      <Box sx={{ backgroundColor: 'white', borderRadius: '12px' }}>
        <Stack spacing={2} sx={{ p: 3 }}>
          {(isAdmin || isManager) && (
            <Stack justifyContent="flex-end">
              <IconButton
                sx={{ marginLeft: 'auto', width: '40px' }}
                id="long-button"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
              >
                <Icon icon="more-horizontal-circle" />
              </IconButton>
              <Menu
                id="long-menu"
                MenuListProps={{
                  'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem
                  key={1}
                  disabled={
                    detailData?.eventTypeId === EventTypeEnum.PermanentScheduledEvent ||
                    detailData?.eventTypeId === EventTypeEnum.MobileEvent ||
                    detailData?.eventTypeId === EventTypeEnum.IntendedEvent ||
                    detailData?.status === EventStatusEnum.Finished.description ||
                    detailData?.status === EventStatusEnum.Cancelled.description ||
                    detailData?.isEmergency ||
                    isAdmin
                  }
                  onClick={() => {
                    handleClose();
                    if (!isEventEditable(detailData?.currentParticipation, detailData?.startDate)) {
                      handleEditCancelDialog();

                      return;
                    }

                    navigate(`/event/fixed-list/${eventId}/edit`);
                  }}
                >
                  <Stack key={1} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Icon icon="solid-pen" /> <Typography>Cập nhật</Typography>
                  </Stack>
                </MenuItem>

                <MenuItem
                  key={2}
                  disabled={
                    detailData?.eventTypeId === EventTypeEnum.PermanentScheduledEvent ||
                    detailData?.status === EventStatusEnum.Finished.description ||
                    detailData?.status === EventStatusEnum.Cancelled.description ||
                    (detailData?.isEmergency && isManager)
                  }
                  onClick={() => {
                    handleClose();
                    handleCancelEventDialog();
                  }}
                >
                  <Stack key={2} direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main' }}>
                    <Icon icon="solid-trash" />
                    <Typography>Hủy sự kiện</Typography>
                  </Stack>
                </MenuItem>
              </Menu>
            </Stack>
          )}

          <EventImageStyle>
            {detailData ? (
              <img
                className="event-img"
                src={detailData?.images ? detailData?.images[0] : DEFAULT_EVENT_IMAGE_URL}
                alt="Ảnh sự kiện"
              />
            ) : (
              <Skeleton variant="rounded" sx={{ maxHeight: '500px', width: '100%', height: '500px' }} />
            )}
          </EventImageStyle>

          {detailData ? (
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

              <Stack direction="row" sx={{ marginTop: '10px' }}>
                <StatusTagStyle label={detailData?.status} />
                {detailData?.isEmergency && <EmergencyTagStyle label="Sự kiện khẩn cấp" />}
              </Stack>

              <Box>{detailData?.description ? parse(`${detailData?.description}`) : 'Chưa cập nhật mô tả'}</Box>
            </Box>
          ) : (
            <Stack spacing={1}>
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="text" width="10%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="60%" />
            </Stack>
          )}

          {detailData ? (
            <Grid rowSpacing={3} container>
              <InfoItemWithIconStyle lg={6} xs={12} item>
                <Stack className="info-item">
                  <Box className="info-item_icon">
                    <Icon icon="solid-location-pin" className="info-item_icon_item" />
                  </Box>
                  <Box sx={{ width: '90%' }}>
                    {detailData?.eventTypeId === EventTypeEnum.MobileEvent && (
                      <>
                        <Typography className="info-item_title">Khu vực lấy máu</Typography>
                        <Typography>
                          {detailData?.eventLocations[0]?.location.name ??
                            detailData?.area
                              .map((item) => {
                                return item?.districtName;
                              })
                              .join(', ')
                              .concat(' - ', detailData?.area[0]?.provinceName)}
                        </Typography>
                      </>
                    )}

                    {(detailData?.eventTypeId === EventTypeEnum.PermanentEvent ||
                      detailData?.eventTypeId === EventTypeEnum.PermanentScheduledEvent) && (
                      <>
                        <Typography className="info-item_title">
                          {detailData?.eventLocations[0]?.location.name || ''}
                        </Typography>
                        <Typography>{detailData?.eventLocations[0]?.location.address || ''}</Typography>
                      </>
                    )}

                    {detailData?.eventTypeId === EventTypeEnum.IntendedEvent && (
                      <>
                        <Typography className="info-item_title">Khu vực lấy máu</Typography>
                        <Typography>{detailData?.intendedProvince?.name}</Typography>
                      </>
                    )}
                  </Box>
                </Stack>
              </InfoItemWithIconStyle>

              <InfoItemWithIconStyle lg={6} xs={12} item>
                <Stack className="info-item">
                  <Box className="info-item_icon">
                    <Icon icon="solid-calendar-star" className="info-item_icon_item" />
                  </Box>
                  <Box>
                    {isStartAndEndDateIsSame(detailData?.startDate, detailData?.endDate) ? (
                      <Typography className="info-item_title">{`${formatDate(detailData?.startDate, 3)}`}</Typography>
                    ) : (
                      <Typography className="info-item_title">{`${formatDate(detailData?.startDate, 3)} - ${formatDate(
                        detailData?.endDate,
                        3
                      )}`}</Typography>
                    )}

                    {detailData?.eventTypeId !== EventTypeEnum.IntendedEvent ? (
                      <Typography>{`${moment(detailData?.workingTimeStart, 'HH:mm').format('HH:mm')} - ${moment(
                        detailData?.workingTimeEnd,
                        'HH:mm'
                      ).format('HH:mm')} `}</Typography>
                    ) : (
                      <Typography>Chưa có thời gian cụ thể</Typography>
                    )}
                  </Box>
                </Stack>
              </InfoItemWithIconStyle>

              <InfoItemWithIconStyle lg={6} xs={12} item>
                <Stack className="info-item">
                  <Box className="info-item_icon">
                    <Icon icon="solid-droplet" className="info-item_icon_item" />
                  </Box>
                  <Box>
                    <Typography className="info-item_title">Nhóm máu cần lấy</Typography>
                    <Box>
                      {detailData?.bloodTypeNeed
                        ? detailData?.bloodTypeNeed.map((e, i) => (
                            <Chip
                              key={i}
                              label={convertBloodTypeLabel(e.bloodTypeId, e.isRhNegative)}
                              sx={{ marginLeft: '5px' }}
                              variant="contained"
                              color="primary"
                            />
                          ))
                        : 'Tất cả nhóm máu'}
                    </Box>
                  </Box>
                </Stack>
              </InfoItemWithIconStyle>

              <InfoItemWithIconStyle lg={6} xs={12} item>
                <Stack className="info-item">
                  <Box className="info-item_avt">
                    <img src={detailData?.hospital.avatarUrl} alt="ảnh đại diện" />
                  </Box>
                  <Box>
                    <Typography className="info-item_title">Đơn vị tổ chức</Typography>
                    <Typography>{detailData?.hospital.name}</Typography>
                  </Box>
                </Stack>
              </InfoItemWithIconStyle>
            </Grid>
          ) : (
            <Grid rowSpacing={3} container>
              <InfoItemWithIconStyle lg={6} xs={12} item>
                <Stack className="info-item">
                  <Box className="info-item_icon">
                    <Icon icon="solid-location-pin" className="info-item_icon_item" />
                  </Box>
                  <Box sx={{ width: '90%' }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                </Stack>
              </InfoItemWithIconStyle>

              <InfoItemWithIconStyle lg={6} xs={12} item>
                <Stack className="info-item">
                  <Box className="info-item_icon">
                    <Icon icon="solid-calendar-star" className="info-item_icon_item" />
                  </Box>
                  <Box sx={{ width: '90%' }}>
                    <Skeleton variant="text" width="50%" />
                    <Skeleton variant="text" width="20%" />
                  </Box>
                </Stack>
              </InfoItemWithIconStyle>

              <InfoItemWithIconStyle lg={6} xs={12} item>
                <Stack className="info-item">
                  <Box className="info-item_icon">
                    <Icon icon="solid-droplet" className="info-item_icon_item" />
                  </Box>
                  <Box>
                    <Typography className="info-item_title">Nhóm máu cần lấy</Typography>
                    <Box>
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Box>
                </Stack>
              </InfoItemWithIconStyle>

              <InfoItemWithIconStyle lg={6} xs={12} item>
                <Stack className="info-item">
                  <Box className="info-item_avt">
                    <Skeleton variant="circular" width="50px" height="50px" />
                  </Box>
                  <Box>
                    <Typography className="info-item_title">Đơn vị tổ chức</Typography>
                    <Skeleton variant="text" width="60%" />
                  </Box>
                </Stack>
              </InfoItemWithIconStyle>
            </Grid>
          )}

          <Grid rowSpacing={3} container>
            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Liên hệ:</TitleItemStyle> {detailData?.contactInformation || '-'}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Mã sự kiện:</TitleItemStyle> {detailData?.eventCode || '-'}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Loại sự kiện:</TitleItemStyle> {detailData?.eventType || '-'}
              </Typography>
            </Grid>

            {detailData?.eventTypeId === EventTypeEnum.MobileEvent && (
              <Grid md={4} sm={6} xs={12} item>
                <Typography>
                  <TitleItemStyle>Số người đăng ký tối thiểu:</TitleItemStyle>{' '}
                  {detailData?.minParticipant ? detailData?.minParticipant : '-'}
                </Typography>
              </Grid>
            )}

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Số người đăng ký tối đa:</TitleItemStyle>{' '}
                {detailData?.maxParticipant === MAX_INT ? '-' : detailData?.maxParticipant}
              </Typography>
            </Grid>

            <Grid md={4} sm={6} xs={12} item>
              <Typography>
                <TitleItemStyle>Số người đăng ký hiện tại:</TitleItemStyle> {detailData?.currentParticipation || 0}
              </Typography>
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ margin: ' 30px 0 30px' }} variant="middle" />
        {/* Volunteer of event */}
        <VolunteerListOfEvent
          isIntendedEvent={detailData?.eventTypeId === EventTypeEnum.IntendedEvent}
          onViewRegistrationArea={handleRegistrationAreaDialog}
        />
      </Box>

      {/* Cancel Event Dialog */}
      <CustomDialog
        isOpen={isCancelEventOpen}
        onClose={handleCancelEventDialog}
        title="Hủy sự kiện"
        children={cancelEventDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />

      {/* Alert Edit/Cancel Event Dialog */}
      <CustomDialog
        isOpen={isEditCancelAlertOpen}
        onClose={handleEditCancelDialog}
        title=""
        children={alertEditCancelDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />

      {/* View Registration Area Dialog */}
      <CustomDialog
        isOpen={isRegistrationAreaOpen}
        onClose={handleRegistrationAreaDialog}
        title=""
        children={registrationAreaDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important' } }}
      />
    </Box>
  );
};

export default EventDetailPage;
