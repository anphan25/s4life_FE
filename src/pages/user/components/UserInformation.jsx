import { DashedBox, ContentTypoStyle, Item, LeftContainer, TitleTypoStyle, HospitalImgStyle } from './UserDetailStyle';
import React from 'react';
import { Stack, Box, Grid } from '@mui/material';
import { formatDate, convertBloodTypeLabel, formatPhoneNumber } from 'utils';

const UserInformation = ({ userInfoData }) => {
  return (
    <Grid container spacing={2}>
      <Grid item md={8} xs={12}>
        <Item>
          <LeftContainer>
            <Stack direction={'column'}>
              <HospitalImgStyle>
                <img
                  src={userInfoData?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'}
                  alt="Ảnh đại diện"
                />
              </HospitalImgStyle>
            </Stack>
            <Stack direction={'column'} flexWrap={'wrap'}>
              <DashedBox>
                <TitleTypoStyle>Họ tên</TitleTypoStyle>
                <ContentTypoStyle>{userInfoData?.fullName || '-'}</ContentTypoStyle>
              </DashedBox>
              <Stack direction={'row'} flexWrap={'wrap'}>
                <DashedBox>
                  <TitleTypoStyle>Số điện thoại</TitleTypoStyle>
                  <ContentTypoStyle>{formatPhoneNumber(userInfoData?.phoneNumber) || '-'}</ContentTypoStyle>
                </DashedBox>
                <DashedBox>
                  <TitleTypoStyle>Ngày tháng năm sinh</TitleTypoStyle>
                  <ContentTypoStyle>{formatDate(userInfoData?.dateOfBirth, 2)}</ContentTypoStyle>
                </DashedBox>
              </Stack>
              <Stack direction={'row'} flexWrap={'wrap'}>
                <DashedBox>
                  <TitleTypoStyle>CCCD</TitleTypoStyle>
                  <ContentTypoStyle>{userInfoData?.nationalId || '-'}</ContentTypoStyle>
                </DashedBox>
                <DashedBox>
                  <TitleTypoStyle>CMND</TitleTypoStyle>
                  <ContentTypoStyle>{userInfoData?.citizenId || '-'}</ContentTypoStyle>
                </DashedBox>
              </Stack>
              <Stack direction={'row'}>
                <DashedBox>
                  <TitleTypoStyle>Giới tính</TitleTypoStyle>
                  <ContentTypoStyle>{userInfoData?.gender || '-'}</ContentTypoStyle>
                </DashedBox>
                <DashedBox>
                  <TitleTypoStyle>Địa chỉ</TitleTypoStyle>
                  <ContentTypoStyle>{userInfoData?.address || '-'}</ContentTypoStyle>
                </DashedBox>
              </Stack>
            </Stack>
          </LeftContainer>
        </Item>
      </Grid>
      <Grid item md={4} xs={12}>
        <Box sx={{ height: '100%' }}>
          <Item sx={{ height: '100%' }}>
            <Stack direction={'column'}>
              <Stack direction={'row'} flexWrap={'wrap'}>
                <DashedBox>
                  <TitleTypoStyle>Nhóm máu</TitleTypoStyle>
                  <ContentTypoStyle>
                    {convertBloodTypeLabel(userInfoData?.bloodTypeId, userInfoData?.bloodTypeId?.isRhNegative)}
                  </ContentTypoStyle>
                </DashedBox>
                <DashedBox>
                  <TitleTypoStyle>Điểm tích lũy</TitleTypoStyle>
                  <ContentTypoStyle>{userInfoData?.bloodPoint || '-'}</ContentTypoStyle>
                </DashedBox>
                <DashedBox>
                  <TitleTypoStyle>Chiều cao</TitleTypoStyle>
                  <ContentTypoStyle>{userInfoData?.height || '-'}</ContentTypoStyle>
                </DashedBox>
                <DashedBox>
                  <TitleTypoStyle>Cân nặng</TitleTypoStyle>
                  <ContentTypoStyle>{userInfoData?.weight || '-'}</ContentTypoStyle>
                </DashedBox>
              </Stack>
            </Stack>
          </Item>
        </Box>
      </Grid>
    </Grid>
  );
};

export default React.memo(UserInformation);
