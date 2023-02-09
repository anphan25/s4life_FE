import { Stack, styled, Paper, Box, Typography, Grid, Backdrop } from '@mui/material';
import { HeaderBreadcumbs, Tag } from 'components';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { formatDate } from 'utils';
import { getBloodDonationApprovalRequestById } from 'api';
import BloodDonationApprovalTable from './components/BloodDonationApprovalTable';
import { HeaderMainStyle } from 'utils';

const TitleItemStyle = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
}));

const ImgBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '550px',
  cursor: 'pointer',

  '& img': { width: '100%', height: '100%', objectFit: 'fill' },
}));

const ApprovalDetail = () => {
  const { id } = useParams();
  const [detailData, setDetailData] = useState();
  const [isZoomedImageOpen, setIsZoomedImageOpen] = useState(false);

  const getDetailData = useCallback(async () => {
    const response = await getBloodDonationApprovalRequestById(id);
    setDetailData(response);
  }, []);

  const handleZoomedImage = async () => {
    setIsZoomedImageOpen(!isZoomedImageOpen);
  };

  const handleLoadImage = (imgLink) => {
    return imgLink;
  };

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
            <ImgBox onClick={handleZoomedImage}>
              <img src={handleLoadImage(detailData?.imageUrl)} alt="ảnh thẻ hiến máu" />
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

      <Backdrop
        open={isZoomedImageOpen}
        onClick={handleZoomedImage}
        sx={{ maxWidth: '100%', '& img': { maxWidth: '90%', maxHeight: '90%' } }}
      >
        <img
          src={
            detailData?.imageUrl ||
            'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vecteezy.com%2Fvector-art%2F5337799-icon-image-not-found-vector&psig=AOvVaw3WbT1vu-vBZ1d3hO9UTuyY&ust=1675343496846000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPjpoYKz9PwCFQAAAAAdAAAAABAE'
          }
          alt="ảnh thẻ hiến máu"
        />
      </Backdrop>
    </Box>
  );
};

export default ApprovalDetail;
