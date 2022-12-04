import React, { useState, useEffect, useCallback } from 'react';
import { FcCancel } from 'react-icons/fc';
import { VscCalendar } from 'react-icons/vsc';
import { MdOutlineWaterDrop, MdOutlineLocationOn } from 'react-icons/md';
import {
  Stack,
  styled,
  Grid,
  Box,
  Paper,
  Typography,
  Divider,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  DialogActions,
  Button,
} from '@mui/material';
import { BsThreeDots } from 'react-icons/bs';
import { AiFillEdit } from 'react-icons/ai';
import { HeaderBreadcumbs, CustomSnackBar, CustomDialog } from 'components';
import moment from 'moment';
import { getEventDetailByEventId, cancelEvent } from 'api/EventApi';
import { useParams, useNavigate } from 'react-router-dom';
import { DEFAULT_EVENT_IMAGE_URL, MAX_INT, convertBloodTypeLabel, errorHandler, formatDate } from 'utils';
import parse from 'html-react-parser';
import VolunteerListOfEvent from './components/VolunteerListOfEvent';
import LoadingButton from '@mui/lab/LoadingButton';

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

  const [cancelEventId, setCancelEventId] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { eventId } = useParams();
  const [isCancelEventOpen, setIsCancelEventOpen] = useState(false);
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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

  const handleCancelEventDialog = () => {
    setIsCancelEventOpen(!isCancelEventOpen);
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
              setAlert({});
              setIsButtonLoading(true);
              try {
                await cancelEvent(cancelEventId);
                await fetchEventDetailData();
                setAlert({ message: `Hủy sự kiện thành công`, status: true, type: 'success' });
              } catch (error) {
                setAlert({ message: errorHandler(error), type: 'error', status: true });
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

  const fetchEventDetailData = useCallback(async () => {
    try {
      const data = await getEventDetailByEventId(eventId);
      setDetailData(data);
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    }
  }, [eventId]);

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
              {/* {EventMenuOptions.map((option) => ( */}
              <MenuItem
                key={1}
                onClick={() => {
                  handleClose();
                  navigate(`/event/${eventId}/edit`);
                }}
                disabled={!isEventEditableOrCancelable(detailData?.status, detailData?.numberOfRegistration)}
              >
                <Stack
                  key={1}
                  onClick={() => {
                    handleClose();
                    navigate(`/event/${eventId}/edit`);
                  }}
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <AiFillEdit /> <Typography>Sửa sự kiện</Typography>
                </Stack>
              </MenuItem>

              <MenuItem
                key={2}
                onClick={() => {
                  handleClose();
                  handleCancelEventDialog();
                }}
                disabled={!isEventEditableOrCancelable(detailData?.status, detailData?.numberOfRegistration)}
              >
                <Stack key={2} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <FcCancel /> <Typography>Hủy sự kiện</Typography>
                </Stack>
              </MenuItem>
            </Menu>
          </Stack>

          <EventImageStyle>
            <img
              className="event-img"
              src={detailData?.eventImages[0].imageUrl || DEFAULT_EVENT_IMAGE_URL}
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

            <Box>{detailData?.description ? parse(`${detailData?.description}`) : 'Chưa cập nhật'}</Box>
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
                  <Box className="info-item_title">
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
        <VolunteerListOfEvent />
      </Paper>

      {/* Cancel Event Dialog */}
      <CustomDialog
        isOpen={isCancelEventOpen}
        onClose={handleCancelEventDialog}
        title="Hủy sự kiện"
        children={cancelEventDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </Box>
  );
};

export default EventDetailPage;
