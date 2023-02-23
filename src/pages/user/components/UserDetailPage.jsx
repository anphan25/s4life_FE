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
  IconButton,
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

  const handleAddBloodDonationDialog = () => {
    setAddBloodDonation(!addBloodDonation);
  };
  const { control: addBloodDonationControl } = useForm({});
  const addBloodDonationDialogContent = () => {
    return (
      <Box>
        <form>
          <IconButton onClick={() => {}} sx={{ float: 'right', mb: 2 }}>
            <Icon icon={'solid-plus'} size={20} />
          </IconButton>
          <Stack direction={'row'} gap={1}>
            <RHFInput
              label="Số máu"
              name="newPhone"
              control={addBloodDonationControl}
              placeholder="Nhập số máu"
              isRequiredLabel={true}
            />{' '}
            <RHFInput
              label="Số túi/Số chứng nhận"
              name="newPhone"
              control={addBloodDonationControl}
              placeholder="Nhập số chứng nhận"
              isRequiredLabel={true}
            />{' '}
            <RHFInput
              label="Ngày hiến"
              name="newPhone"
              control={addBloodDonationControl}
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
          links={[{ name: 'Danh sách tài khoản', to: '/user/list' }, { name: 'Thông tin tài khoản ' }]}
        />
        <Button startIcon={<Icon icon="solid-pen-line" />} variant="contained" onClick={handleAddBloodDonationDialog}>
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
                  <img
                    src="https://scontent.fsgn10-2.fna.fbcdn.net/v/t39.30808-6/331098133_751372076185497_1620582518450751546_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=8Nz7wSa_Jf0AX-jLeFV&_nc_ht=scontent.fsgn10-2.fna&oh=00_AfCyMfHOaOuNGwsoEHu7OCsxMgLIlOVck1zDHtZYMXodcw&oe=63FC6A42"
                    alt="Ảnh đại diện"
                  />
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
                    Đoàn Phạm Bich Hợp
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
                      Nữ
                    </Typography>
                  </DashedBox>
                </Stack>
                <Stack direction={'row'}>
                  <DashedBox>
                    <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                      Địa chỉ
                    </Typography>
                    <Typography align="left" fontSize={'16px'} fontWeight={600}>
                      Gò Vấp, Hồ Chí Minh city
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
                    A
                  </Typography>
                </DashedBox>
                <DashedBox>
                  <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                    Yếu tố Rh
                  </Typography>
                  <Typography align="left" fontSize={'16px'} fontWeight={600}>
                    A+
                  </Typography>
                </DashedBox>
                <DashedBox>
                  <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                    Chiều cao
                  </Typography>
                  <Typography align="left" fontSize={'16px'} fontWeight={600}>
                    160cm
                  </Typography>
                </DashedBox>
                <DashedBox>
                  <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                    Cân nặng
                  </Typography>
                  <Typography align="left" fontSize={'16px'} fontWeight={600}>
                    hihi
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
        onClose={handleAddBloodDonationDialog}
        title={`Thêm lịch sử hiến máu`}
        children={addBloodDonationDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />
    </Box>
  );
};

export default UserDetailPage;
