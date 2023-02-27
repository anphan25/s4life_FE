import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatDate, HeaderMainStyle, convertBloodTypeLabel, errorHandler, convertErrorCodeToMessage } from 'utils';
import isValidDate from 'utils/extensions/datetime/isValidDate';
import { Stack, Box, Button, Grid, Divider, IconButton } from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { CustomDialog, RHFInput, RHFDatePicker, Icon, HeaderBreadcumbs, CustomSnackBar } from 'components';
import { useParams } from 'react-router-dom';
import { getUserInfoById, addBloodDonations } from 'api';
import { openHubConnection, listenOnHub, listenOnHubInBulkOperations } from 'config';
import { useStore } from 'react-redux';

const UserDetailPage = () => {
  const [connection, setConnection] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [addBloodDonation, setAddBloodDonation] = useState(false);
  const [userInfoData, setUserInfoData] = useState(null);
  const { userId } = useParams();
  const store = useStore();
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const childRef = useRef();

  const AddDonationHistorySchema = Yup.object().shape({
    bloodDonations: Yup.array().of(
      Yup.object().shape({
        donationVolume: Yup.number()
          .nullable()
          .transform((value) => {
            if (!value) return null;

            return value;
          })
          .required('Vui lòng nhập số đơn vị máu')
          .min(1, 'Vui lòng nhập số lớn hơn 0'),
        bloodBagCode: Yup.string()
          .required('Vui lòng nhập số túi máu/số chứng nhận')
          .max(32, 'Vui lòng không nhập quá 32 ký tự'),
        donationDate: Yup.date()
          .nullable()
          .transform(isValidDate)
          .typeError('Ngày không hợp lệ')
          .required('Vui lòng nhập ngày hiến'),
      })
    ),
  });
  const handleAddBloodDonationHistoryDialog = () => {
    setAddBloodDonation(!addBloodDonation);
    reset();
  };

  const handleAddField = () => {
    append({ donationVolume: 0, bloodBagCode: '', donationDate: null });
  };

  const onSubmit = async (data) => {
    setIsButtonLoading(true);
    const mappingBloodDonations = data?.bloodDonations?.map((data) => ({
      ...data,
      donationDate: data?.donationDate.toISOString(),
    }));

    try {
      await addBloodDonations({ userInformationId: userId, bloodDonations: mappingBloodDonations });

      childRef.current.reloadDonationHistories();
      handleAddBloodDonationHistoryDialog();
      fetchUserInfo();
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(AddDonationHistorySchema),
    mode: 'onChange',
    defaultValues: { bloodDonations: [{ donationVolume: 0, bloodBagCode: '', donationDate: null }] },
    reValidateMode: 'onChange',
  });

  const { fields, remove, append } = useFieldArray({
    name: 'bloodDonations',
    control,
  });

  const addBloodDonationHistoryDialogContent = () => {
    return (
      <Box>
        <Box sx={{ textAlign: 'right' }}>
          <IconButton color="primary" onClick={handleAddField} sx={{ marginLeft: 'auto' }}>
            <Icon icon="solid-plus" />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((item, index) => (
            <Stack direction={'row'} gap={1} key={item.id}>
              <RHFInput
                type="number"
                label="Số đơn vị máu"
                name={`bloodDonations[${index}].donationVolume`}
                control={control}
                placeholder="Nhập số đơn vị máu"
                isRequiredLabel={true}
              />
              <RHFInput
                label="Số túi máu/Số chứng nhận"
                name={`bloodDonations[${index}].bloodBagCode`}
                control={control}
                placeholder="Nhập số túi máu/số chứng nhận"
                isRequiredLabel={true}
              />
              <RHFDatePicker
                disableFuture
                label="Ngày hiến"
                name={`bloodDonations[${index}].donationDate`}
                control={control}
                placeholder="Nhập ngày hiến"
                isRequiredLabel={true}
              />

              <IconButton
                sx={{
                  width: '50px',
                  height: '50px',
                }}
                disabled={index === 0}
                color="error"
                onClick={() => {
                  console.log('index', index);
                  remove(index);
                }}
              >
                <Icon icon="minus-circle" />
              </IconButton>
            </Stack>
          ))}

          <Stack>
            <Box sx={{ marginLeft: 'auto', marginTop: '20px' }}>
              <LoadingButton type="submit" variant="contained" loading={isButtonLoading}>
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

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHubInBulkOperations(connection, (result, messageCode) => {
      console.log('result', result);
      console.log('messageCode', messageCode);
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

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
                <DashedBox>
                  <TitleTypoStyle>Họ tên</TitleTypoStyle>
                  <ContentTypoStyle>{userInfoData?.fullName || '-'}</ContentTypoStyle>
                </DashedBox>
                <Stack direction={'row'} flexWrap={'wrap'}>
                  <DashedBox>
                    <TitleTypoStyle>Số điện thoại</TitleTypoStyle>
                    <ContentTypoStyle>{userInfoData?.phoneNumber || '-'}</ContentTypoStyle>
                  </DashedBox>
                  <DashedBox>
                    <TitleTypoStyle>Ngày tháng năm sinh</TitleTypoStyle>
                    <ContentTypoStyle>{formatDate(userInfoData?.dateOfBirth, 2)}</ContentTypoStyle>
                  </DashedBox>
                </Stack>
                <Stack direction={'row'} flexWrap={'wrap'}>
                  <DashedBox>
                    <TitleTypoStyle>CMND/CCCD</TitleTypoStyle>
                    <ContentTypoStyle>{userInfoData?.nationalId || '-'}</ContentTypoStyle>
                  </DashedBox>
                  <DashedBox>
                    <TitleTypoStyle>Giới tính</TitleTypoStyle>
                    <ContentTypoStyle>{userInfoData?.gender || '-'}</ContentTypoStyle>
                  </DashedBox>
                </Stack>
                <Stack direction={'row'}>
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

      <Divider sx={{ margin: ' 40px 0 30px' }} />

      <BloodDonationHistory ref={childRef} />

      {/* Add blood donation dialog */}
      <CustomDialog
        isOpen={addBloodDonation}
        onClose={handleAddBloodDonationHistoryDialog}
        title={`Thêm lịch sử hiến máu`}
        children={addBloodDonationHistoryDialogContent()}
        sx={{ '& .MuiDialog-paper': { maxWidth: '70%', maxHeight: '500px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </Box>
  );
};

export default UserDetailPage;
