import React, { useState, useEffect, useCallback } from 'react';
import { formatDate, HeaderMainStyle, PASSWORD_PATTERN, convertBloodTypeLabel } from 'utils';
import { Stack, Box, Typography, Button, Grid, Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  DashedBox,
  ContentTypoStyle,
  Item,
  LeftContainer,
  TitleTypoStyle,
  HospitalImgStyle,
} from './components/UserDetailStyle';
import BloodDonationHistory from './components/BloodDonationHistory';
import { CustomDialog, RHFInput, Icon, HeaderBreadcumbs } from 'components';
import { useParams } from 'react-router-dom';
import { getUserInfoById } from 'api';

const UserDetailPage = () => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [addBloodDonation, setAddBloodDonation] = useState(false);
  const [userInfoData, setUserInfoData] = useState(null);
  const { userId } = useParams();

  const ChangePasswordSchema = Yup.object().shape({
    newPassword: Yup.string().required('Vui lòng nhập mật khẩu mới.').matches(PASSWORD_PATTERN, {
      message:
        'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
      excludeEmptyString: false,
    }),
    confirmPassword: Yup.string()
      .required('Vui lòng nhập lại mật khẩu.')
      .matches(PASSWORD_PATTERN, {
        message:
          'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
        excludeEmptyString: false,
      })
      .oneOf([Yup.ref('newPassword')], 'Xác nhận mật khẩu không trùng khớp.'),
  });
  const handleAddBloodDonationHistoryDialog = () => {
    setAddBloodDonation(!addBloodDonation);
  };

  const {
    handleSubmit: handleChangePasswordSubmit,
    control: changePasswordControl,
    reset: changePasswordReset,
  } = useForm({
    resolver: yupResolver(ChangePasswordSchema),
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
    reValidateMode: 'onChange',
  });

  const addBloodDonationHistoryDialogContent = () => {
    return (
      <Box>
        <form>
          <Stack direction={'row'} gap={1}>
            <RHFInput
              label="Số máu"
              name="newPhone"
              control={changePasswordControl}
              placeholder="Nhập số máu"
              isRequiredLabel={true}
            />{' '}
            <RHFInput
              label="Số túi/Số chứng nhận"
              name="newPhone"
              control={changePasswordControl}
              placeholder="Nhập số chứng nhận"
              isRequiredLabel={true}
            />{' '}
            <RHFInput
              label="Ngày hiến"
              name="newPhone"
              control={changePasswordControl}
              placeholder="Nhập ngày hiến"
              isRequiredLabel={true}
            />
          </Stack>

          <Stack>
            <Box sx={{ marginLeft: 'auto', marginTop: '20px' }}>
              <LoadingButton variant="contained" type="submit" loading={isButtonLoading}>
                Thêm
              </LoadingButton>
            </Box>
          </Stack>
        </form>
      </Box>
    );
  };

  const fetchUserInfo = useCallback(async () => {
    setUserInfoData(await getUserInfoById(userId));
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return (
    <Box>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Thông tin tình nguyện viên"
          links={[{ name: 'Danh sách tài khoản', to: '/user/list' }, { name: `${userInfoData?.fullName}` }]}
        />

        <Button
          startIcon={<Icon icon="solid-plus" />}
          variant="contained"
          onClick={handleAddBloodDonationHistoryDialog}
        >
          Thêm lịch sử hiến máu
        </Button>
      </HeaderMainStyle>
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
                <Typography align="left" fontSize={'16px'} fontWeight={600} sx={{ mb: 1 }}>
                  Thông tin liên hệ
                </Typography>
                <DashedBox>
                  <TitleTypoStyle>Họ tên</TitleTypoStyle>
                  <ContentTypoStyle>{userInfoData?.fullName}</ContentTypoStyle>
                </DashedBox>
                <Stack direction={'row'} flexWrap={'wrap'}>
                  <DashedBox>
                    <TitleTypoStyle>Số điện thoại</TitleTypoStyle>
                    <ContentTypoStyle>{userInfoData?.phoneNumber}</ContentTypoStyle>
                  </DashedBox>
                  <DashedBox>
                    <TitleTypoStyle>Ngày tháng năm sinh</TitleTypoStyle>
                    <ContentTypoStyle>{formatDate(userInfoData?.dateOfBirth, 2)}</ContentTypoStyle>
                  </DashedBox>
                </Stack>
                <Stack direction={'row'} flexWrap={'wrap'}>
                  <DashedBox>
                    <TitleTypoStyle>CMND/CCCD</TitleTypoStyle>
                    <ContentTypoStyle>{userInfoData?.nationalId}</ContentTypoStyle>
                  </DashedBox>
                  <DashedBox>
                    <TitleTypoStyle>Giới tính</TitleTypoStyle>
                    <ContentTypoStyle>{userInfoData?.gender}</ContentTypoStyle>
                  </DashedBox>
                </Stack>
                <Stack direction={'row'}>
                  <DashedBox>
                    <TitleTypoStyle>Địa chỉ</TitleTypoStyle>
                    <ContentTypoStyle>{userInfoData?.address}</ContentTypoStyle>
                  </DashedBox>
                </Stack>
              </Stack>
            </LeftContainer>
          </Item>
        </Grid>
        <Grid item md={4} xs={12}>
          <Box>
            <Item>
              <Stack direction={'column'}>
                <Typography align="left" fontSize={'16px'} fontWeight={600} sx={{ mb: 1 }}>
                  Thông tin sức khoẻ
                </Typography>

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
                    <ContentTypoStyle>01/03/2001</ContentTypoStyle>
                  </DashedBox>
                  <DashedBox>
                    <TitleTypoStyle>Cân nặng</TitleTypoStyle>
                    <ContentTypoStyle>01/03/2001</ContentTypoStyle>
                  </DashedBox>
                </Stack>
              </Stack>
            </Item>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ margin: '30px' }} />

      <BloodDonationHistory />

      <CustomDialog
        isOpen={addBloodDonation}
        onClose={handleAddBloodDonationHistoryDialog}
        title={`Thêm lịch sử hiến máu`}
        children={addBloodDonationHistoryDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />
    </Box>
  );
};

export default UserDetailPage;
