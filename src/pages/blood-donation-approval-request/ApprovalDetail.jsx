import { Stack, styled, Paper, Box, Typography, Grid } from '@mui/material';
import { HeaderBreadcumbs, Tag } from 'components';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { formatDate } from 'utils';
import { getBloodDonationApprovalRequestById } from 'api';
import BloodDonationApprovalTable from './components/BloodDonationApprovalTable';

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

const ImgBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '500px',

  '& img': { width: '100%', height: '100%', objectFit: 'fill' },
}));

const ApprovalDetail = () => {
  const { id } = useParams();
  const [detailData, setDetailData] = useState();

  const getDetailData = useCallback(async () => {
    const response = await getBloodDonationApprovalRequestById(id);
    setDetailData(response);
  }, []);

  useEffect(() => {
    getDetailData();
  }, [getDetailData]);

  return (
    <Box>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Chi tiết yêu cầu"
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Yêu cầu phê duyệt hiến máu', to: '/blood-donation-approval-request' },
            { name: 'Chi tiết yêu cầu' },
          ]}
        />
      </HeaderMainStyle>

      <Paper sx={{ borderRadius: '12px', padding: '30px' }} elevation={1}>
        <Grid container spacing={4} mb={5}>
          <Grid item sm={12} md={6}>
            <ImgBox>
              <img src={detailData?.imageUrl} alt="ảnh thẻ hiến máu" />
            </ImgBox>
          </Grid>

          <Grid item sm={12} md={6}>
            <Stack spacing={3}>
              <Typography>
                <TitleItemStyle>Họ và tên: </TitleItemStyle>
                {detailData?.user?.userInformation?.fullName}
              </Typography>
              <Typography>
                <TitleItemStyle>Số điện thoại: </TitleItemStyle>
                {detailData?.user?.userName}
              </Typography>
              <Typography>
                <TitleItemStyle>Giới tính : </TitleItemStyle>
                {detailData?.user?.userInformation?.gender}
              </Typography>
              <Typography>
                <TitleItemStyle>Ngày sinh: </TitleItemStyle>
                {formatDate(detailData?.user?.userInformation?.dateOfBirth, 2)}
              </Typography>
              <Typography>
                <TitleItemStyle>CMND/CCCD: </TitleItemStyle>
                {detailData?.user?.userInformation?.nationalId}
              </Typography>
              <Typography>
                <TitleItemStyle>Địa chỉ: </TitleItemStyle>
                {detailData?.user?.userInformation?.address}
              </Typography>
              <Typography>
                <TitleItemStyle>Trạng thái phê duyệt: </TitleItemStyle>
                <Tag status={detailData?.isProcessing ? 'warning' : 'success'}>
                  {detailData?.isProcessing ? 'Đang xử lý' : 'Đã xử lý'}
                </Tag>
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <BloodDonationApprovalTable detailData={detailData} />
      </Paper>
    </Box>
  );
};

export default ApprovalDetail;
