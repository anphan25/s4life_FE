import React, { useState, useMemo } from 'react';
import {
  EMAIL_PATTERN,
  PHONE_NUMBER_PATTERN,
  LONGITUDE_PATTERN,
  LATITUDE_PATTERN,
  isValidTime,
  errorHandler,
  convertDayLabel,
} from 'utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Grid, Paper, Stack, Typography, Box, Button } from '@mui/material';
import { RHFInput, RHFTimePicker } from 'components';
import RHFSwitch from 'components/react-hook-form/RHFSwitch';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { editHospital } from 'api';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingButton from '@mui/lab/LoadingButton';

function transformTime(value, originalValue) {
  if (this.isType(value)) {
    return value;
  }

  return isValidTime(value);
}

const EditHospitalInfoForm = ({ hospitalInfo = null }) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { hospitalId } = useParams();

  const defaultValues = useMemo(
    () => ({
      name: hospitalInfo?.name,
      address: hospitalInfo?.address,
      latitude: hospitalInfo?.latitude,
      longitude: hospitalInfo?.longitude,
      email: hospitalInfo?.email,
      phoneNumber: hospitalInfo?.phoneNumber,
      nextWeekSchedule: hospitalInfo?.nextWeekSchedule,
    }),
    [hospitalInfo]
  );

  // Custom Validation
  Yup.addMethod(Yup.string, 'validateLongitude', function (errorMessage) {
    return this.test(`test-longitude`, errorMessage, function (value, context) {
      const { path, createError } = this;

      const isValid = Math.abs(value * 1) >= -180 && Math.abs(value * 1) <= 180 && value.match(LONGITUDE_PATTERN);

      return isValid || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.string, 'validateLatitude', function (errorMessage) {
    return this.test(`test-latitude`, errorMessage, function (value, context) {
      const { path, createError } = this;

      const isValid = Math.abs(value * 1) >= -90 && Math.abs(value * 1) <= 90 && value.match(LATITUDE_PATTERN);

      return isValid || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'isStartTimeBeforeEndTime', function (errorMessage) {
    return this.test(`test-start-time-before-end-time`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const startTime = moment(context.parent.startTime);
      const endTime = moment(context.parent.endTime);

      if (startTime.isSameOrBefore(endTime, 'hours'))
        clearErrors([context.path, context.path.replace('startTime', 'endTime')]);

      return startTime.isSameOrBefore(endTime, 'hours') || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'isEndTimeAfterStartTime', function (errorMessage) {
    return this.test(`test-end-time-after-start-time`, errorMessage, function (value, context) {
      const { path, createError } = this;

      const startTime = moment(context.parent.startTime);
      const endTime = moment(context.parent.endTime);

      if (endTime.isSameOrAfter(startTime, 'hours'))
        clearErrors([context.path, context.path.replace('endTime', 'startTime')]);

      return endTime.isSameOrAfter(startTime, 'hours') || createError({ path, message: errorMessage });
    });
  });

  const EditHospitalInfoSchema = Yup.object().shape({
    name: Yup.string()
      .transform((value) => {
        return value.trim();
      })
      .required('Vui lòng nhập tên')
      .max(128, 'Tên không được dài quá 128 kí tự'),
    address: Yup.string()
      .transform((value) => {
        return value.trim();
      })
      .required('Vui lòng nhập địa chỉ')
      .max(128, 'Địa chỉ không được dài quá 128 kí tự'),
    latitude: Yup.string().required('Vui lòng nhập vĩ độ').validateLatitude('Vĩ độ không hợp lệ'),
    longitude: Yup.string().required('Vui lòng nhập kinh độ').validateLongitude('Kinh độ không hợp lệ'),
    email: Yup.string()
      .required('Vui lòng nhập email')
      .matches(EMAIL_PATTERN, { message: 'Email không hợp lệ', excludeEmptyString: false }),
    phoneNumber: Yup.string()
      .required('Vui lòng nhập số điện thoại')
      .trim('Số điện thoại không hợp lệ')
      .matches(PHONE_NUMBER_PATTERN, { message: 'Số điện thoại không hợp lệ', excludeEmptyString: false }),
    nextWeekSchedule: Yup.array().of(
      Yup.object().shape({
        day: Yup.number(),
        startTime: Yup.date()
          .nullable()
          .transform(transformTime)
          .typeError('Giờ không hợp lệ')
          .required('Vui lòng nhập giờ bắt đầu')
          .isStartTimeBeforeEndTime('Giờ bắt đầu phải trước giờ kết thúc'),
        endTime: Yup.date()
          .nullable()
          .transform(transformTime)
          .typeError('Giờ không hợp lệ')
          .required('Vui lòng nhập giờ kết thúc')
          .isEndTimeAfterStartTime('Giờ kết thúc phải sau giờ bắt đầu'),
        isEnabled: Yup.boolean(),
      })
    ),
  });

  const {
    handleSubmit,
    control,
    formState: { dirtyFields }, //Do not remove
    getValues,
    clearErrors,
  } = useForm({
    resolver: yupResolver(EditHospitalInfoSchema),
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    setIsButtonLoading(true);

    const formatSchedule = data?.nextWeekSchedule?.map((day) => ({
      ...day,
      startTime: moment(day?.startTime, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss'),
      endTime: moment(day?.endTime, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss'),
    }));

    delete data?.nextWeekSchedule;

    try {
      await editHospital({ ...data, openingTime: formatSchedule });
      setTimeout(() => {
        navigate(`/hospital/${hospitalId}`);
      }, [1500]);
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} sx={{ '& .MuiFormControl-root': { marginBottom: 'auto' } }}>
        <Grid xs={12} md={6} item>
          <Paper elevation={1} sx={{ borderRadius: '20px', padding: '30px' }}>
            <Stack spacing={2}>
              <RHFInput isRequiredLabel={true} name="name" label="Tên" control={control} placeholder="Nhập tên" />
              <RHFInput
                isRequiredLabel={true}
                name="address"
                label="Địa chỉ"
                control={control}
                placeholder="Nhập địa chỉ"
              />
              <Stack spacing={2} direction="row">
                <RHFInput
                  isRequiredLabel={true}
                  name="latitude"
                  label="Vĩ độ"
                  control={control}
                  placeholder="Nhập vĩ độ"
                />
                <RHFInput
                  isRequiredLabel={true}
                  name="longitude"
                  label="Kinh độ"
                  control={control}
                  placeholder="Nhập kinh độ"
                />
              </Stack>
              <RHFInput name="email" label="Email" control={control} placeholder="Nhập email" />
              <RHFInput
                isRequiredLabel={true}
                name="phoneNumber"
                label="Số điện thoại"
                control={control}
                placeholder="Nhập số điện thoại"
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid xs={12} md={6} item>
          <Paper elevation={1} sx={{ borderRadius: '20px', padding: '30px' }}>
            <Typography variant="h5" mb={2}>
              Lịch lấy máu tuần sau
            </Typography>
            <Stack>
              {getValues('nextWeekSchedule').map(({ day }, index) => (
                <Stack key={day} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight="bold">{convertDayLabel(day)}</Typography>

                  <Stack direction="row" spacing={2} alignItems="center">
                    {getValues(`nextWeekSchedule[${index}].isEnabled`) ? (
                      <Stack sx={{ width: '350px' }} direction="row" alignItems="center" spacing={2}>
                        <RHFTimePicker mask="__:__" name={`nextWeekSchedule[${index}].startTime`} control={control} />

                        <Typography sx={{ marginBottom: 'auto' }}>Đến</Typography>

                        <RHFTimePicker mask="__:__" name={`nextWeekSchedule[${index}].endTime`} control={control} />
                      </Stack>
                    ) : (
                      <Typography fontSize={14} sx={{ color: 'error.main' }}>
                        Đóng cửa
                      </Typography>
                    )}

                    <RHFSwitch name={`nextWeekSchedule[${index}].isEnabled`} control={control} />
                  </Stack>
                </Stack>
              ))}
            </Stack>

            <Stack direction="row" mt={2}>
              <Box sx={{ marginLeft: 'auto' }}>
                <Button
                  sx={{ marginRight: '10px' }}
                  onClick={() => {
                    navigate(`/hospital/${hospitalId}`);
                  }}
                >
                  Hủy
                </Button>
                <LoadingButton loading={isButtonLoading} type="submit" variant="contained">
                  Cập nhật
                </LoadingButton>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </form>
  );
};

export default React.memo(EditHospitalInfoForm);
