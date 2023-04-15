import React from 'react';
import { Stack, styled, Grid, Box, Typography, Chip, Skeleton } from '@mui/material';
import { Icon, Tag } from 'components';
import moment from 'moment';
import {
  MAX_INT,
  convertBloodTypeLabel,
  formatDate,
  isStartAndEndDateIsSame,
  EventTypeEnum,
  getLabelFromEventStatus,
  getEnumDescriptionByValue,
  EventStatusEnum,
} from 'utils';
import parse from 'html-react-parser';

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

const EventDetailInfo = ({ detailData }) => {
  // const StatusTagStyle = styled(Chip)(({ theme }) => ({
  //   borderRadius: '8px',
  //   height: 'auto',
  //   marginBottom: '15px',
  //   padding: '4px 6px',
  //   fontWeight: 'bold',
  //   fontSize: '12px',
  //   backgroundColor: theme.palette[`${TagStyleConvert(detailData?.status)}`]?.light,
  //   color: theme.palette[`${TagStyleConvert(detailData?.status)}`]?.main,
  // }));

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

  const TitleItemStyle = styled('span')(({ theme }) => ({
    fontWeight: 'bold',
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

  return (
    <Stack spacing={2}>
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

          <Stack direction="row" sx={{ marginTop: '10px', marginBottom: '15px' }}>
            <Tag status={getLabelFromEventStatus(detailData?.statusId)}>
              {getEnumDescriptionByValue(EventStatusEnum, detailData?.statusId)}
            </Tag>
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
  );
};

export default React.memo(EventDetailInfo);
