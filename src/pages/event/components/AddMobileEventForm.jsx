import React, { useState, useEffect } from 'react';
import { Stack, MenuItem, Paper, Grid, Button, Box, Typography } from '@mui/material';
import { RHFInput, RHFEditor, RHFAutoComplete, RHFDatePicker, RHFTimePicker, RHFUploadImage } from 'components';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import moment from 'moment';
import { DEFAULT_EVENT_IMAGE_URL, PHONE_NUMBER_PATTERN, MAX_INT, errorHandler } from 'utils';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { storage } from 'config/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getDistrictsByProvinceId, getAllProvinces, createEvent } from 'api';
import { convertErrorCodeToMessage, isValidDate, isValidTime } from 'utils';
import { useCallback } from 'react';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useSnackbar } from 'notistack';

const minDateHandler = () => {
  return moment().add(7, 'days');
};

const AddMobileEventForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [imgUploadFile, setImgUploadFile] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState(0);
  const [connection, setConnection] = useState(null);

  const store = useStore();

  const navigate = useNavigate();

  const defaultValues = {
    name: '',
    description: '',
    beginEvent: moment().add(7, 'days'),
    workingTimeStart: moment(),
    workingTimeEnd: moment().add(1, 'hours'),
    province: 0,
    districts: [],
    imageUrls: [DEFAULT_EVENT_IMAGE_URL],
  };

  const addMobileEventHandler = async (params) => {
    try {
      await createEvent(params);

      setTimeout(() => {
        navigate('/event/mobile-list');
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
            addMobileEventHandler(data);
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

  Yup.addMethod(Yup.date, 'isStartTimeBeforeEndTime', function (errorMessage) {
    return this.test(`test-start-time-before-end-time`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const workingTimeStart = moment(context.parent.workingTimeStart);
      const workingTimeEnd = moment(context.parent.workingTimeEnd);

      if (workingTimeStart.isSameOrBefore(workingTimeEnd, 'hours')) clearErrors(['workingTimeStart', 'workingTimeEnd']);

      return workingTimeStart.isSameOrBefore(workingTimeEnd, 'hours') || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'isEndTimeAfterStartTime', function (errorMessage) {
    return this.test(`test-end-time-after-start-time`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const workingTimeStart = moment(context.parent.workingTimeStart);
      const workingTimeEnd = moment(context.parent.workingTimeEnd);

      if (workingTimeEnd.isSameOrAfter(workingTimeStart, 'hours')) clearErrors(['workingTimeStart', 'workingTimeEnd']);

      return workingTimeEnd.isSameOrAfter(workingTimeStart, 'hours') || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validTimeDuration', function (errorMessage) {
    return this.test(`test-valid-time-duration`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const workingTimeStart = moment(context.parent.workingTimeStart);
      const workingTimeEnd = moment(context.parent.workingTimeEnd);
      const duration = workingTimeEnd.diff(workingTimeStart, 'hours');

      return Math.abs(duration) >= 1 || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.number, 'validateMinAndMax', function (errorMessage) {
    return this.test(`test-valid-min-max`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const minParticipant = moment(context.parent.minParticipant);
      const maxParticipant = moment(context.parent.maxParticipant);

      return minParticipant < maxParticipant || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validDateBaseOnCurrentDate', function (errorMessage) {
    return this.test(`test-valid-date-base-on-now`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const beginEvent = context.parent.beginEvent;

      return (
        moment().add(7, 'days').isSameOrBefore(moment(beginEvent), 'dates') ||
        createError({ path, message: errorMessage })
      );
    });
  });

  function transformTime(value, originalValue) {
    if (this.isType(value)) {
      return value;
    }

    return isValidTime(value);
  }

  function transformDate(value, originalValue) {
    if (this.isType(value)) {
      return value;
    }

    return isValidDate(value);
  }

  const AddEventSchema = Yup.object().shape({
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

    beginEvent: Yup.date()
      .nullable()
      .transform(transformDate)
      .typeError('Ngày không hợp lệ')
      .required('Vui lòng nhập ngày bắt đầu')
      .validDateBaseOnCurrentDate('Ngày bắt đầu phải hơn hiện tại 7 ngày'),
    workingTimeStart: Yup.date()
      .nullable()
      .transform(transformTime)
      .typeError('Giờ không hợp lệ')
      .required('Vui lòng nhập giờ bắt đầu')
      .isStartTimeBeforeEndTime('Giờ bắt đầu phải trước giờ kết thúc')
      .validTimeDuration('Giờ bắt đầu và giờ kết thúc phải cách nhau ít nhất 1 giờ'),
    workingTimeEnd: Yup.date()
      .nullable()
      .transform(transformTime)
      .typeError('Giờ không hợp lệ')
      .required('Vui lòng nhập giờ kết thúc')
      .isEndTimeAfterStartTime('Giờ kết thúc phải sau giờ bắt đầu')
      .validTimeDuration('Giờ bắt đầu và giờ kết thúc phải cách nhau ít nhất 1 giờ'),
    maxParticipant: Yup.number()
      .nullable()
      .transform((value) => {
        if (isNaN(value) || !value) return null;
        return value;
      })
      .min(1, 'Vui lòng nhập số lớn hơn hoặc bằng 1')
      .max(MAX_INT, 'Số nhập vào quá lớn')
      .required('Vui lòng nhập số người tham gia tối đa')
      .validateMinAndMax('Số người tham gia tối đa phải lớn hơn số người tham gia tối thiếu'),
    minParticipant: Yup.number()
      .nullable()
      .transform((value) => {
        if (isNaN(value) || !value) return null;
        return value;
      })
      .min(1, 'Vui lòng nhập số lớn hơn hoặc bằng 1')
      .max(MAX_INT, 'Số nhập vào quá lớn')
      .required('Vui lòng nhập số người tham gia tối thiểu')
      .validateMinAndMax('Số người tham gia tối đa phải lớn hơn số người tham gia tối thiếu'),
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
    districts: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.number(),
          name: Yup.string(),
        })
      )
      .transform(function (value, originalValue) {
        if (value?.length < 1 || !value) return [];
        return [...value];
      })
      .min(1, 'Vui lòng chọn quận huyện'),
  });

  const { handleSubmit, control, resetField, clearErrors } = useForm({
    resolver: yupResolver(AddEventSchema),
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    console.log('data', data);
    setIsButtonLoading(true);

    const areas = data?.districts.map((item) => {
      return { provinceId: data?.province[0]?.id, districtId: item?.id };
    });

    const mappingData = {
      name: data?.name,
      description: data?.description,
      eventType: 3,
      imageUrls: data?.imageUrls,
      areas,
      startDate: moment(data?.beginEvent).format('yyyy-MM-DD'),
      endDate: moment(data?.beginEvent).format('yyyy-MM-DD'),
      workingTimeStart: moment(data?.workingTimeStart, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss'),
      workingTimeEnd: moment(data?.workingTimeEnd, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss'),
      contactInformation: data?.contactInformation,
      minParticipant: data?.minParticipant,
      maxParticipant: data?.maxParticipant,
    };

    if (imgUploadFile) {
      await uploadImage(mappingData);

      return;
    }
    setImgUploadFile(null);
    addMobileEventHandler(mappingData);
  };

  const handleUploadEventImg = (file) => {
    setImgUploadFile(file);
  };

  const fetchAllProvinces = useCallback(async () => {
    const rawProvinces = await getAllProvinces(0);
    const mappingProvinces = rawProvinces.map((d) => ({ id: d.id, name: d.name }));

    setProvinces(mappingProvinces);
  }, []);

  const fetchDistrictsByProvinceId = useCallback(async () => {
    // Remove district autocomplete when clearing province
    if (!selectedProvinceId || selectedProvinceId === 0) {
      setDistricts([]);
      resetField('districts');

      return;
    }

    const rawDistrict = await getDistrictsByProvinceId(0, selectedProvinceId);
    const mappingDistricts = rawDistrict.map((d) => ({ id: d.id, name: d.name }));

    setDistricts(mappingDistricts);
  }, [selectedProvinceId]);

  useEffect(() => {
    fetchAllProvinces();
  }, [fetchAllProvinces]);

  useEffect(() => {
    fetchDistrictsByProvinceId();
  }, [fetchDistrictsByProvinceId]);

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
                  onSelect={(value) => {
                    setSelectedProvinceId(value?.id || null);
                  }}
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

                {selectedProvinceId !== 0 && selectedProvinceId && (
                  <RHFAutoComplete
                    multiple={true}
                    paramsCompare="id"
                    isRequiredLabel={true}
                    list={districts}
                    name="districts"
                    label="Quận huyện"
                    control={control}
                    placeholder="Chọn quận huyện"
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => (
                      <MenuItem key={uuidv4()} value={option} {...props}>
                        {option.name}
                      </MenuItem>
                    )}
                  />
                )}

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
                    name="beginEvent"
                    control={control}
                    label="Ngày bắt đầu"
                    placeholder="Nhập ngày bắt đầu"
                    minDate={minDateHandler()}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <RHFTimePicker
                    mask="__:__"
                    isRequiredLabel={true}
                    name="workingTimeStart"
                    control={control}
                    label="Giờ bắt đầu"
                    placeholder="Nhập giờ bắt đầu"
                  />

                  <RHFTimePicker
                    mask="__:__"
                    isRequiredLabel={true}
                    name="workingTimeEnd"
                    control={control}
                    label="Giờ kết thúc"
                    placeholder="Nhập giờ kết thúc"
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <RHFInput
                    isRequiredLabel={true}
                    type="number"
                    name="minParticipant"
                    control={control}
                    label="Số người tham gia tối thiểu"
                    placeholder="Nhập số người tham gia tối thiểu"
                  />

                  <RHFInput
                    isRequiredLabel={true}
                    type="number"
                    name="maxParticipant"
                    control={control}
                    label="Số người tham gia tối đa"
                    placeholder="Nhập số người tham gia tối đa"
                  />
                </Stack>

                <Stack direction="row">
                  <Box sx={{ marginLeft: 'auto' }}>
                    <Button
                      sx={{ marginRight: '10px' }}
                      onClick={() => {
                        navigate('/event/mobile-list');
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

export default React.memo(AddMobileEventForm);
