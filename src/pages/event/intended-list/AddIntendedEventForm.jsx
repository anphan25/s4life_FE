import React, { useState, useEffect } from 'react';
import { Stack, MenuItem, Paper, Grid, Button, Box, Typography } from '@mui/material';
import { RHFInput, RHFEditor, RHFAutoComplete, RHFDatePicker, RHFUploadImage } from 'components';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import moment from 'moment';
import { DEFAULT_EVENT_IMAGE_URL, PHONE_NUMBER_PATTERN, MAX_INT, errorHandler, EventTypeEnum } from 'utils';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { storage } from 'config/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAllProvinces, createEvent } from 'api';
import { convertErrorCodeToMessage, isValidDate } from 'utils';
import { useCallback } from 'react';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useSnackbar } from 'notistack';

const AddIntendedEventForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [imgUploadFile, setImgUploadFile] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [connection, setConnection] = useState(null);

  const store = useStore();
  const minDate = moment().add(7, 'days');

  const navigate = useNavigate();

  const defaultValues = {
    name: '',
    description: '',
    startDate: minDate,
    endDate: minDate,
    province: 0,
    imageUrls: [DEFAULT_EVENT_IMAGE_URL],
  };

  const addIntendedEventHandler = async (params) => {
    try {
      await createEvent(params);

      setTimeout(() => {
        navigate('/event/intended-list');
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

  const uploadImage = async (data) => {
    const filePath = `event-images/`;

    const name = uuidv4();
    const storageRef = await ref(storage, `${filePath}/${name}`);

    if (!imgUploadFile) {
      return;
    }

    const uploadTask = uploadBytesResumable(storageRef, imgUploadFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {},
      (error) => {
        enqueueSnackbar(errorHandler({ response: { data: { code: 10001 } } }), {
          variant: 'error',
          persist: false,
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            data.imageUrls[0] = downloadURL;
          })
          .then(() => {
            addIntendedEventHandler(data);
          });
      }
    );
  };
  //Custom validate
  Yup.addMethod(Yup.string, 'validateBlankDescription', function (errorMessage) {
    return this.test(`test-blank-description`, errorMessage, function (value, context) {
      const { path, createError } = this;

      const temp1 = value.replace('<p>', '');
      const temp2 = temp1.replace('</p>', '');
      const temp3 = temp2.replaceAll('&nbsp;', '');

      return temp3.trim() !== '' || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validDateBaseOnCurrentDate', function (errorMessage) {
    return this.test(`test-valid-date-base-on-now`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const startDate = context.parent.startDate;
      const endDate = context.parent.endDate;

      return (
        (moment().add(7, 'days').isSameOrBefore(moment(startDate), 'dates') &&
          moment().add(7, 'days').isSameOrBefore(moment(endDate), 'dates')) ||
        createError({ path, message: errorMessage })
      );
    });
  });

  Yup.addMethod(Yup.date, 'isStartDateBeforeOrSameEndDate', function (errorMessage) {
    return this.test(`test-valid-startDate`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const startDate = moment(context.parent.startDate);
      const endDate = moment(context.parent.endDate);

      if (startDate.isSameOrBefore(endDate, 'dates')) clearErrors(['startDate', 'endDate']);

      return startDate.isSameOrBefore(endDate, 'dates') || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'isEndDateAfterOrSameStartDate', function (errorMessage) {
    return this.test(`test-valid-endDate`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const startDate = moment(context.parent.startDate);
      const endDate = moment(context.parent.endDate);

      if (endDate.isSameOrAfter(startDate, 'dates')) clearErrors(['startDate', 'endDate']);

      return endDate.isSameOrAfter(startDate, 'dates') || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validateValidDate', function (errorMessage) {
    return this.test(`test-valid-date`, errorMessage, function (value, context) {
      const { path, createError } = this;

      return value !== 'Invalid Date' || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validDaysDuration', function (errorMessage) {
    return this.test(`test-valid-day-duration`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const startDate = moment(context.parent.startDate);
      const endDate = moment(context.parent.endDate);
      const duration = endDate.diff(startDate, 'days');

      return Math.abs(duration) <= 30 || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validateDurationStartAndCurrentDate', function (errorMessage) {
    return this.test(`test-current-start-date-duration`, errorMessage, function (value, context) {
      const { path, createError } = this;

      const diff = moment(value).diff(moment(), 'days');

      return (diff >= 0 && diff <= 365) || createError({ path, message: errorMessage });
    });
  });

  function transformDate(value, originalValue) {
    if (this.isType(value)) {
      return value;
    }

    return isValidDate(value);
  }

  const AddIntendedEventSchema = Yup.object().shape({
    name: Yup.string()
      .transform((value) => {
        return value.trim();
      })
      .required('Vui lòng nhập tên')
      .max(128, 'Tên không được dài quá 128 kí tự'),
    description: Yup.string()
      .validateBlankDescription('Vui lòng nhập mô tả')
      .required('Vui lòng nhập mô tả')
      .max(512, 'Mô tả không được dài quá 512 kí tự'),
    contactInformation: Yup.string()
      .required('Vui lòng nhập số điện thoại liên hệ')
      .trim('Số điện thoại liên hệ không hợp lệ ')
      .matches(PHONE_NUMBER_PATTERN, { message: 'Số điện thoại liên hệ không hợp lệ', excludeEmptyString: false }),

    startDate: Yup.date()
      .nullable()
      .transform(transformDate)
      .typeError('Ngày không hợp lệ')
      .required('Vui lòng nhập ngày bắt đầu')
      .isStartDateBeforeOrSameEndDate('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc')
      .validateDurationStartAndCurrentDate('Không thể tạo sự kiện cách hiện tại quá 365 ngày')
      .validDateBaseOnCurrentDate('Ngày bắt đầu phải hơn hiện tại 7 ngày')
      .validDaysDuration('Khoảng cách giữa ngày bắt đầu và ngày kết thúc là tối đa 30 ngày'),

    endDate: Yup.date()
      .nullable()
      .transform(transformDate)
      .typeError('Ngày không hợp lệ')
      .required('Vui lòng nhập ngày kết thúc')
      .isEndDateAfterOrSameStartDate('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu')
      .validDateBaseOnCurrentDate('Ngày bắt đầu phải hơn hiện tại 7 ngày')
      .validDaysDuration('Khoảng cách giữa ngày bắt đầu và ngày kết thúc là tối đa 30 ngày'),
    province: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.number(),
          name: Yup.string(),
        })
      )
      .transform(function (value, originalValue) {
        if (originalValue?.length < 1 || !originalValue) return [];
        return [
          {
            id: originalValue?.id,
            name: originalValue?.name,
          },
        ];
      })
      .min(1, 'Vui lòng chọn tỉnh thành'),
  });

  const { handleSubmit, control, clearErrors } = useForm({
    resolver: yupResolver(AddIntendedEventSchema),
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setIsButtonLoading(true);

    const mappingData = {
      name: data?.name,
      description: data?.description,
      eventType: EventTypeEnum.IntendedEvent,
      imageUrls: data?.imageUrls,
      IntendedProvinceId: data?.province[0]?.id,
      startDate: moment(data?.startDate).format('yyyy-MM-DD'),
      endDate: moment(data?.endDate).format('yyyy-MM-DD'),
      contactInformation: data?.contactInformation,
      minParticipant: 0,
      maxParticipant: MAX_INT,
    };

    if (imgUploadFile) {
      await uploadImage(mappingData);

      return;
    }
    setImgUploadFile(null);
    addIntendedEventHandler(mappingData);
  };

  const handleUploadEventImg = (file) => {
    setImgUploadFile(file);
  };

  const fetchAllProvinces = useCallback(async () => {
    const rawProvinces = await getAllProvinces(0);
    const mappingProvinces = rawProvinces.map((d) => ({ id: d.id, name: d.name }));

    setProvinces(mappingProvinces);
  }, []);

  useEffect(() => {
    fetchAllProvinces();
  }, [fetchAllProvinces]);

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHub(connection, (messageCode) => {
      enqueueSnackbar(convertErrorCodeToMessage(messageCode), {
        variant: messageCode < 0 ? 'error' : 'success',
        persist: false,
      });
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid xs={12} md={6} item>
            <Paper elevation={1} sx={{ borderRadius: '20px', padding: '30px' }}>
              <Stack spacing={2}>
                <RHFInput isRequiredLabel={true} name="name" label="Tên" control={control} placeholder="Nhập tên" />
                <RHFEditor
                  isRequiredLabel={true}
                  name="description"
                  label="Mô tả"
                  defaultValue=""
                  control={control}
                  placeholder="Nhập mô tả"
                />

                <RHFUploadImage
                  label="Ảnh sự kiện"
                  borderRadius="15px"
                  width="100%"
                  height="270px"
                  name="imageUrls"
                  control={control}
                  onUpload={handleUploadEventImg}
                />
              </Stack>
            </Paper>
          </Grid>
          <Grid xs={12} md={6} item>
            <Paper elevation={1} sx={{ borderRadius: '20px', padding: '30px' }}>
              <Stack>
                <RHFAutoComplete
                  isRequiredLabel={true}
                  label="Tỉnh thành"
                  paramsCompare="id"
                  name="province"
                  list={provinces}
                  control={control}
                  placeholder="Chọn tỉnh thành"
                  getOptionLabel={(option) => {
                    return option?.name || '';
                  }}
                  renderOption={(props, option) => (
                    <MenuItem key={option.id} value={option.id} {...props}>
                      <Typography>{option?.name}</Typography>
                    </MenuItem>
                  )}
                />

                <Stack spacing={2} direction="row">
                  <RHFInput
                    isRequiredLabel={true}
                    name="contactInformation"
                    label="Số điện thoại liên hệ"
                    control={control}
                    placeholder="Nhập số điện thoại liên hệ"
                  />
                </Stack>

                <Stack spacing={2} direction="row">
                  <RHFDatePicker
                    disablePast
                    isRequiredLabel={true}
                    name="startDate"
                    control={control}
                    label="Ngày bắt đầu"
                    placeholder="Nhập ngày bắt đầu"
                    minDate={minDate}
                  />
                  <RHFDatePicker
                    disablePast
                    isRequiredLabel={true}
                    name="endDate"
                    control={control}
                    label="Ngày kết thúc"
                    placeholder="Nhập ngày kết thúc"
                    minDate={minDate}
                  />
                </Stack>

                <Stack direction="row">
                  <Box sx={{ marginLeft: 'auto' }}>
                    <Button
                      sx={{ marginRight: '10px' }}
                      onClick={() => {
                        navigate('/event/intended-list');
                      }}
                    >
                      Hủy
                    </Button>
                    <LoadingButton type="submit" loading={isButtonLoading} variant="contained">
                      Tạo
                    </LoadingButton>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default React.memo(AddIntendedEventForm);
