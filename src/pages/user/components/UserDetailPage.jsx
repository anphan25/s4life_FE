import React, { useState, useEffect, useCallback } from 'react';

import {
  errorHandler,
  convertDayLabel,
  convertErrorCodeToMessage,
  HeaderMainStyle,
  DialogButtonGroupStyle,
  PASSWORD_PATTERN,
} from 'utils';
import {
  Stack,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  styled,
  Switch,
  FormControl,
  FormControlLabel,
  Tooltip,
  Divider,
} from '@mui/material';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import LoadingButton from '@mui/lab/LoadingButton';

import { DashedBox, HospitalImgStyle, Item, LeftContainer, PlaceholderStyle } from './UserDetailStyle';
import BloodDonationHistory from './BloodDonationHistory';

import { CustomDialog, CustomSnackBar, RHFUploadImage, RHFImport, RHFInput, Icon, HeaderBreadcumbs } from 'components';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const UserDetailPage = () => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [addBloodDonation, setAddBloodDonation] = useState(false);
  const user = useSelector((state) => state.auth?.auth?.user);

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
  const handleChangePhoneNumberDialog = () => {
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
  const changePhoneNumberDialogContent = () => {
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
  return (
    <Box>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Thông tin bệnh viện"
          links={[{ name: 'Danh sách tài khoản', to: '/user/list' }, { name: 'toàn ' }]}
        />
        <Button startIcon={<Icon icon="solid-pen-line" />} variant="contained" onClick={handleChangePhoneNumberDialog}>
          Thêm lịch sử hiến máu
        </Button>
      </HeaderMainStyle>
      <Grid container spacing={2}>
        <Grid item md={8} sm={6} xs={12}>
          <Item>
            <LeftContainer>
              <Stack direction={'column'}>
                <HospitalImgStyle>
                  <PlaceholderStyle>
                    <Icon icon="solid-camera" />
                    <Typography variant="caption">Cập nhật ảnh</Typography>
                  </PlaceholderStyle>
                  <img src="https://source.unsplash.com/random" alt="Ảnh bệnh viện" />
                </HospitalImgStyle>
              </Stack>
              <Stack direction={'column'} flexWrap={'wrap'}>
                <Typography align="left" fontSize={'16px'} fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                  Thông tin liên hệ
                </Typography>
                <DashedBox>
                  <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                    Họ tên
                  </Typography>
                  <Typography align="left" fontSize={'16px'} fontWeight={600}>
                    Đoàn Phạm Bitch Hợp
                  </Typography>
                </DashedBox>
                <Stack direction={'row'} flexWrap={'wrap'}>
                  <DashedBox>
                    <Typography align="left" fontSize={'12px'} fontWeight={500} color="grey.500">
                      Số điện thoại
                    </Typography>
                    <Typography align="left" fontSize={'16px'} fontWeight={600}>
                      0708985897
                    </Typography>
                  </DashedBox>
                  <DashedBox>
                    <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                      Ngày tháng năm sinh
                    </Typography>
                    <Typography align="left" fontSize={'16px'} fontWeight={600}>
                      01/03/2001
                    </Typography>
                  </DashedBox>
                </Stack>
                <Stack direction={'row'} flexWrap={'wrap'}>
                  <DashedBox>
                    <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                      CMND/CCCD
                    </Typography>
                    <Typography align="left" fontSize={'16px'} fontWeight={600}>
                      012345678910
                    </Typography>
                  </DashedBox>
                  <DashedBox>
                    <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                      Giới tính
                    </Typography>
                    <Typography align="left" fontSize={'16px'} fontWeight={600}>
                      Nam
                    </Typography>
                  </DashedBox>
                </Stack>
                <Stack direction={'row'}>
                  <DashedBox>
                    <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                      Địa chỉ
                    </Typography>
                    <Typography align="left" fontSize={'16px'} fontWeight={600}>
                      Phường Đống Đa, Hà Lội
                    </Typography>
                  </DashedBox>
                </Stack>
              </Stack>
            </LeftContainer>
          </Item>
        </Grid>
        <Grid item md={4} sm={6} xs={12}>
          <Item>
            <Stack direction={'column'} alignItems="center">
              <Typography fontSize={16} fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                Thông tin sức khoẻ
              </Typography>
              <Stack direction={'row'} flexWrap={'wrap'}>
                <DashedBox>
                  <Typography align="left" fontSize={'12px'} fontWeight={500} color="grey.500">
                    Nhóm máu
                  </Typography>
                  <Typography align="left" fontSize={'16px'} fontWeight={600}>
                    0708985897
                  </Typography>
                </DashedBox>
                <DashedBox>
                  <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                    Yếu tố Rh
                  </Typography>
                  <Typography align="left" fontSize={'16px'} fontWeight={600}>
                    01/03/2001
                  </Typography>
                </DashedBox>
                <DashedBox>
                  <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                    Chiều cao
                  </Typography>
                  <Typography align="left" fontSize={'16px'} fontWeight={600}>
                    01/03/2001
                  </Typography>
                </DashedBox>
                <DashedBox>
                  <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                    Cân nặng
                  </Typography>
                  <Typography align="left" fontSize={'16px'} fontWeight={600}>
                    01/03/2001
                  </Typography>
                </DashedBox>
              </Stack>
            </Stack>
          </Item>
        </Grid>
      </Grid>
      <Divider sx={{ margin: '30px' }} />

      <BloodDonationHistory />
      <CustomDialog
        isOpen={addBloodDonation}
        onClose={handleChangePhoneNumberDialog}
        title={`Thêm lịch sử hiến máu`}
        children={changePhoneNumberDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />
    </Box>
  );
};

export default UserDetailPage;
