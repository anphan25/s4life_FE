import React, { useState, useEffect, useMemo } from 'react';
import { Stack, Paper, Button, Box } from '@mui/material';
import { CustomSnackBar } from 'components';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { RHFInput, RHFRadio, RHFDatePicker } from 'components';
import { updateUserInfo } from 'api';
import {
  GenderEnum,
  PHONE_NUMBER_PATTERN,
  isValidDate,
  errorHandler,
  convertErrorCodeToMessage,
  UserInformationUpdateModeEnum,
} from 'utils';
import moment from 'moment';
import LoadingButton from '@mui/lab/LoadingButton';
import { useParams, useNavigate } from 'react-router-dom';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useForm } from 'react-hook-form';

const GenderOptionList = Object.keys(GenderEnum).map((key) => ({
  label: GenderEnum[key].description,
  value: GenderEnum[key].value,
}));

const EditUserInformationForm = ({ userInfoData }) => {
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const navigate = useNavigate();
  const { userInformationId } = useParams();
  const store = useStore();

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [connection, setConnection] = useState(null);

  function transformDate(value, originalValue) {
    if (this.isType(value)) {
      return value;
    }

    return isValidDate(value);
  }

  //Custom validate
  Yup.addMethod(Yup.date, 'validateDOB', function (errorMessage) {
    return this.test(`test-valid-DOB`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const dateOfBirth = context.parent.dateOfBirth;
      const yearOlds = moment().diff(dateOfBirth, 'years');

      return (18 <= yearOlds && yearOlds <= 60) || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.string, 'nationalIdOrCitizenIdRequired', function (errorMessage) {
    return this.test(`test-valid-DOB`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const nationalId = context.parent.nationalId;
      const citizenId = context.parent.citizenId;

      return nationalId || citizenId || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.string, 'isValidNationalId', function (errorMessage) {
    return this.test(`test-valid-nationalId`, errorMessage, function (value, context) {
      const { path, createError } = this;

      if (value === null) return true;

      return value?.length === 12 || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.string, 'isValidCitizenId', function (errorMessage) {
    return this.test(`test-valid-citizenId`, errorMessage, function (value, context) {
      const { path, createError } = this;

      if (value === null) return true;

      return value?.length === 9 || createError({ path, message: errorMessage });
    });
  });

  const EditUserInfoSchema = Yup.object().shape({
    nationalId: Yup.string()
      .nullable()
      .transform((value) => {
        if (!value) return null;
        return value?.trim();
      })
      .isValidNationalId('CCCD không hợp lệ')
      .nationalIdOrCitizenIdRequired('Vui lòng nhập ít nhất 1 trường trong 2 trường CMND và CCCD'),
    citizenId: Yup.string()
      .nullable()
      .transform((value) => {
        if (!value) return null;
        return value?.trim();
      })
      .isValidCitizenId('CMND không hợp lệ')
      .nationalIdOrCitizenIdRequired('Vui lòng nhập ít nhất 1 trường trong 2 trường CMND và CCCD'),
    phoneNumber: Yup.string()
      .trim('Số điện thoại liên hệ không hợp lệ')
      .matches(PHONE_NUMBER_PATTERN, { message: 'Số điện thoại liên hệ không hợp lệ', excludeEmptyString: false })
      .required('Vui lòng nhập số điện thoại liên hệ'),
    fullName: Yup.string()
      .transform((value) => {
        return value.trim();
      })
      .required('Vui lòng nhập tên')
      .max(64, 'Tên không được dài quá 64 kí tự'),
    dateOfBirth: Yup.date()
      .nullable()
      .transform(transformDate)
      .typeError('Ngày tháng năm sinh không hợp lệ')
      .required('Vui lòng nhập ngày tháng năm sinh')
      .validateDOB('Tuổi hiến máu hợp lệ của tình nguyện viên là từ 18 đến 60'),
    address: Yup.string()
      .transform((value) => {
        return value.trim();
      })
      .required('Vui lòng nhập địa chỉ')
      .max(128, 'Địa chỉ không được dài quá 128 kí tự'),
  });

  const defaultValues = useMemo(
    () => ({
      nationalId: userInfoData?.nationalId,
      citizenId: userInfoData?.citizenId,
      phoneNumber: userInfoData?.phoneNumber,
      fullName: userInfoData?.fullName,
      dateOfBirth: userInfoData?.dateOfBirth,
      address: userInfoData?.address,
      gender: userInfoData?.gender,
    }),
    [userInfoData]
  );

  const {
    handleSubmit,
    control,
    formState: { dirtyFields },
  } = useForm({
    resolver: yupResolver(EditUserInfoSchema),
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    setIsButtonLoading(true);
    setAlert({});
    const changedFields = {};

    for (const [key, value] of Object.entries(dirtyFields)) {
      changedFields[key] = data[key];
    }

    const editParams = {
      userInformationId,
      updateMode: UserInformationUpdateModeEnum.AdminUpdation,
      adminUpdationInformation: { ...changedFields },
    };

    try {
      await updateUserInfo(editParams);
      setTimeout(() => {
        navigate('/user/list');
      }, [1500]);
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHub(connection, (messageCode) => {
      setAlert({
        message: convertErrorCodeToMessage(messageCode),
        type: messageCode < 0 ? 'error' : 'success',
        status: true,
      });
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  return (
    <>
      <Paper elevation={1} sx={{ borderRadius: '20px', padding: '30px' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <RHFInput
            isRequiredLabel={true}
            name="fullName"
            label="Họ và Tên"
            control={control}
            placeholder="Nhập họ và tên"
          />
          <Stack spacing={2} direction="row">
            <RHFInput
              isRequiredLabel={true}
              name="phoneNumber"
              label="Số điện thoại"
              control={control}
              placeholder="Nhập số điện thoại"
            />

            <RHFDatePicker
              isRequiredLabel={true}
              disableFuture
              name="dateOfBirth"
              control={control}
              label="Ngày tháng năm sinh"
              placeholder="Nhập ngày tháng năm sinh"
            />
          </Stack>

          <Stack spacing={2} direction="row">
            <RHFInput
              isRequiredLabel={true}
              name="citizenId"
              label="CMND"
              type="number"
              control={control}
              placeholder="Nhập CMND"
            />
            <RHFInput
              isRequiredLabel={true}
              name="nationalId"
              label="CCCD"
              type="number"
              control={control}
              placeholder="Nhập CCCD"
            />
          </Stack>

          <RHFInput
            isRequiredLabel={true}
            name="address"
            label="Địa chỉ"
            control={control}
            placeholder="Nhập địa chỉ"
          />

          <RHFRadio
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
            control={control}
            label="Giới tính"
            isRequiredLabel={true}
            name="gender"
            options={GenderOptionList.map((option) => option.value)}
            getOptionLabel={GenderOptionList.map((option) => option.label)}
          />

          <Stack direction="row">
            <Box sx={{ marginLeft: 'auto' }}>
              <Button
                sx={{ marginRight: '10px' }}
                onClick={() => {
                  navigate('/user/list');
                }}
              >
                Hủy
              </Button>
              <LoadingButton loading={isButtonLoading} type="submit" variant="contained">
                Cập nhật
              </LoadingButton>
            </Box>
          </Stack>
        </form>
      </Paper>

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
};

export default React.memo(EditUserInformationForm);
