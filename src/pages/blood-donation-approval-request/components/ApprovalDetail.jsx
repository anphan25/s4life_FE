import { styled, Paper, Box, Typography, Grid, Backdrop, CircularProgress } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { formatDate } from 'utils';
import { getBloodDonationApprovalRequestById } from 'api';
import BloodDonationApprovalTable from './BloodDonationApprovalTable';
import { Tag } from 'components';

const TitleItemStyle = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
}));

const ImgBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '550px',
  cursor: 'pointer',

  '& img': { width: '100%', height: '100%', objectFit: 'fill' },
}));

const ApprovalDetail = ({ id }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [detailData, setDetailData] = useState();
  const [isZoomedImageOpen, setIsZoomedImageOpen] = useState(false);

  const getDetailData = useCallback(async () => {
    setIsLoading(true);
    const response = await getBloodDonationApprovalRequestById(id);
    setDetailData(response);
    setIsLoading(false);
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
      {isLoading ? (
        <Box sx={{ position: 'relative', width: '1000px', height: '500px' }}>
          <CircularProgress
            sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: '12px', padding: '30px' }} elevation={1}>
          <Grid container spacing={4} mb={5}>
            <Grid item sm={12} md={4}>
              <Typography>
                <TitleItemStyle>Họ và tên: </TitleItemStyle>
                {detailData?.user?.userInformation?.fullName}
              </Typography>
            </Grid>
            <Grid item sm={12} md={4}>
              <Typography>
                <TitleItemStyle>Số điện thoại: </TitleItemStyle>
                {detailData?.user?.phoneNumber}
              </Typography>
            </Grid>
            <Grid item sm={12} md={4}>
              <Typography>
                <TitleItemStyle>Giới tính : </TitleItemStyle>
                {detailData?.user?.userInformation?.gender}
              </Typography>
            </Grid>
            <Grid item sm={12} md={4}>
              <Typography>
                <TitleItemStyle>Ngày sinh: </TitleItemStyle>
                {formatDate(detailData?.user?.userInformation?.dateOfBirth, 2)}
              </Typography>
            </Grid>
            <Grid item sm={12} md={4}>
              <Typography>
                <TitleItemStyle>CMND/CCCD: </TitleItemStyle>
                {detailData?.user?.userInformation?.nationalId}
              </Typography>
            </Grid>
            <Grid item sm={12} md={4}>
              <Typography>
                <TitleItemStyle>Địa chỉ: </TitleItemStyle>
                {detailData?.user?.userInformation?.address}
              </Typography>
            </Grid>
            <Grid item sm={12} md={4}>
              <Typography>
                <TitleItemStyle>Trạng thái phê duyệt: </TitleItemStyle>
                <Tag status={detailData?.isProcessing ? 'warning' : 'success'}>
                  {detailData?.isProcessing ? 'Đang xử lý' : 'Đã xử lý'}
                </Tag>
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={4} mb={5}>
            <Grid item sm={12} md={5}>
              <ImgBox onClick={handleZoomedImage}>
                <img src={handleLoadImage(detailData?.imageUrl)} alt="ảnh thẻ hiến máu" />
              </ImgBox>
            </Grid>

            <Grid item sm={12} md={7}>
              <BloodDonationApprovalTable detailData={detailData} />
            </Grid>
          </Grid>
        </Paper>
      )}

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

export default React.memo(ApprovalDetail);
