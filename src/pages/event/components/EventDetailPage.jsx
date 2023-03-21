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
  isEventEditableOrCancelable,
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

  const eventListNavigator = (eventType) => {
    switch (eventType) {
      case 'Sự kiện cố định theo lịch bệnh viện': {
        return { label: 'Danh sách sự kiện cố định theo lịch bệnh viện', link: '/event/schedule-list/' };
      }
      case 'Sự kiện cố định': {
        return { label: 'Danh sách sự kiện cố định', link: '/event/fixed-list/' };
      }
      case 'Sự kiện lưu động': {
        return { label: 'Danh sách sự kiện lưu động', link: '/event/mobile-list/' };
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
            Hủy sự kiện
          </LoadingButton>
        </DialogButtonGroup>
      </Box>
    );
  };

  const alertEditCancelDialogContent = () => {
    return (
      <Box>
        <Typography>
          Chỉ được sửa hoặc hủy sự kiện trước 3 ngày sự kiện bắt đầu và sự kiện không có tình nguyện viên đăng ký
        </Typography>
        <Typography sx={{ marginTop: '10px' }}>
          Vui lòng liên hệ quản trị viên nếu bạn muốn hủy vô điều kiện.
        </Typography>

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

  const fetchEventDetailData = useCallback(async () => {
    try {
      const data = await getEventDetailByEventId(eventId);
      setIsHospitalScheduleEvent(data.eventTypeId === EventTypeEnum.PermanentScheduledEvent);

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
              name: eventListNavigator(detailData?.eventType)?.label || '-',
              to: eventListNavigator(detailData?.eventType)?.link || '-',
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
                    detailData?.status === EventStatusEnum.Finished.description ||
                    detailData?.status === EventStatusEnum.Cancelled.description ||
                    detailData?.isEmergency ||
                    isAdmin
                  }
                  onClick={() => {
                    handleClose();
                    if (
                      !isEventEditableOrCancelable(
                        detailData?.numberOfRegistration,
                        detailData?.startDate,
                        user.role,
                        1
                      )
                    ) {
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
                    detailData?.eventType === EventTypeEnum.PermanentScheduledEvent ||
                    detailData?.status === EventStatusEnum.Finished.description ||
                    detailData?.status === EventStatusEnum.Cancelled.description ||
                    (detailData?.isEmergency && isManager)
                  }
                  onClick={() => {
                    handleClose();

                    if (
                      !isEventEditableOrCancelable(
                        detailData?.numberOfRegistration,
                        detailData?.startDate,
                        user.role,
                        2
                      )
                    ) {
                      handleEditCancelDialog();

                      return;
                    }
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
                    {detailData?.eventType === 'Sự kiện lưu động' ? (
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
                    ) : (
                      <>
                        <Typography className="info-item_title">
                          {detailData?.eventLocations[0]?.location.name || ''}
                        </Typography>
                        <Typography>{detailData?.eventLocations[0]?.location.address || ''}</Typography>
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
                    <img src={detailData?.hospital.avatarUrl} alt="ảnh đại diện" />
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

            {detailData?.eventType === 'Sự kiện lưu động' && (
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
                <TitleItemStyle>Số người đăng ký hiện tại:</TitleItemStyle> {detailData?.numberOfRegistration || 0}
              </Typography>
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ margin: ' 30px 0 30px' }} variant="middle" />

        {/* Volunteer of event */}
        <VolunteerListOfEvent />
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
    </Box>
  );
};

export default EventDetailPage;
