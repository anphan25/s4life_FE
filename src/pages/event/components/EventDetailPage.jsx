import React, { useState, useEffect, useCallback } from 'react';
import { Stack, styled, Box, Typography, Divider, Menu, MenuItem, IconButton, Button, Skeleton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { HeaderBreadcumbs, CustomDialog, Icon } from 'components';
import { getEventDetailByEventId } from 'api/EventApi';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DEFAULT_EVENT_IMAGE_URL,
  errorHandler,
  isEventEditable,
  convertErrorCodeToMessage,
  EventTypeEnum,
  RoleEnum,
  EventStatusEnum,
  DialogButtonGroupStyle,
  HeaderMainStyle,
} from 'utils';
import VolunteerListOfEvent from './VolunteerListOfEvent';
import { useSelector } from 'react-redux';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useSnackbar } from 'notistack';
import { NotFoundIcon } from 'assets';
import EventDetailInfo from './EventDetailInfo';
import CancelEventForm from './CancelEventForm';

const EventDetailPage = () => {
  const [detailData, setDetailData] = useState(null);
  const [cancelEventId, setCancelEventId] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const { eventId } = useParams();
  const [isCancelEventOpen, setIsCancelEventOpen] = useState(false);
  const [isEditCancelAlertOpen, setIsEditCancelAlertOpen] = useState(false);
  const [isHospitalScheduleEvent, setIsHospitalScheduleEvent] = useState(false);
  const [registrationAreas, setRegistrationAreas] = useState([]);
  const [isRegistrationAreaOpen, setIsRegistrationAreaOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState([]);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
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

  const handleErrorDialog = () => {
    setIsErrorDialogOpen(!isErrorDialogOpen);
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
        <Typography>
          Bạn có chắc chắn muốn hủy sự kiện này không ?<br /> Nếu có vui lòng nhập lý do bên dưới.
        </Typography>
        <CancelEventForm
          eventId={cancelEventId}
          onFinishSubmit={async () => {
            await fetchEventDetailData();
          }}
          handleCloseDialog={() => {
            handleCancelEventDialog();
          }}
        />
      </Box>
    );
  };

  const alertEditCancelDialogContent = () => {
    return (
      <Box>
        <Typography>
          Chỉ được chỉnh sửa sự kiện trước 3 ngày sự kiện bắt đầu và sự kiện không có tình nguyện viên đăng ký.
        </Typography>

        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button
            variant="contained"
            onClick={() => {
              handleEditCancelDialog();
            }}
          >
            Ok
          </Button>
        </DialogButtonGroupStyle>
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
              minHeight: 400,
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

              setSelectedDistrict(selectedRows);
            }}
          />
        </Box>

        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button
            disabled={selectedDistrict.length <= 0}
            variant="contained"
            onClick={() => {
              if (
                detailData?.statusId === EventStatusEnum.Cancelled.value ||
                detailData?.statusId === EventStatusEnum.Finished.value
              ) {
                handleErrorDialog();

                return;
              }
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
        </DialogButtonGroupStyle>
      </Box>
    );
  };

  const errorDialogContent = () => {
    return (
      <Box>
        <Typography>Không thể tạo sự kiện lưu động từ sự kiện lưu động dự kiến đã kết thúc hoặc đã bị hủy</Typography>

        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button
            variant="contained"
            onClick={() => {
              handleErrorDialog();
            }}
          >
            Ok
          </Button>
        </DialogButtonGroupStyle>
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

        setRegistrationAreas(
          registrationAreaList?.map((item) => ({ ...item, id: item?.districtId })).sort((a, b) => b?.count - a?.count)
        );
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
                    detailData?.statusId === EventStatusEnum.Finished.value ||
                    detailData?.statusId === EventStatusEnum.Cancelled.value ||
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
                    detailData?.statusId === EventStatusEnum.Finished.value ||
                    detailData?.statusId === EventStatusEnum.Cancelled.value ||
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

          <EventDetailInfo detailData={detailData} />
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

      {/* Error Dialog */}
      <CustomDialog
        isOpen={isErrorDialogOpen}
        onClose={handleErrorDialog}
        title=""
        children={errorDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important' } }}
      />
    </Box>
  );
};

export default EventDetailPage;
