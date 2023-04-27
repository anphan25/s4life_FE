import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Stack, MenuItem, Paper, Grid, Button, Box, Typography } from '@mui/material';
import {
  RHFInput,
  RHFEditor,
  RHFAutoComplete,
  RHFDatePicker,
  RHFTimePicker,
  RHFUploadImage,
  CustomDialog,
} from 'components';
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
import { getDistrictsByProvinceId, getAllProvinces, createEvent } from 'api';
import {
  convertErrorCodeToMessage,
  isValidDate,
  isValidTime,
  formatDate,
  DialogButtonGroupStyle,
  areDistrictsNearby,
} from 'utils';
import { useCallback } from 'react';
import { openHubConnection, listenOnHub } from 'config';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useSnackbar } from 'notistack';
import { listenOnHubToGetConfig } from 'config';
import { setConfig } from 'app/slices/ConfigSlice';

const AddMobileEventForm = ({ intendedData = null }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [imgUploadFile, setImgUploadFile] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [connection, setConnection] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const store = useStore();
  const submitBtnRef = useRef(null);
  const navigate = useNavigate();
  let isConfirmDone = false;
  let isAlertDone = false;
  const config = useSelector((state) => state.config.data);
  const dispatch = useDispatch();
  const minDate = moment().add(config.minDaysUntilMobileEventStart, 'days');

  const defaultValues = {
    name: '',
    description: '',
    beginEvent: minDate,
    workingTimeStart: moment(),
    workingTimeEnd: moment().add(1, 'hours'),
    province: 0,
    districts: [],
    imageUrls: [DEFAULT_EVENT_IMAGE_URL],
  };

  const intendedValues = useMemo(
    () => ({
      name: '',
      description: '',
      beginEvent: moment().isSameOrBefore(moment(intendedData?.intendedStartDate), 'dates')
        ? moment(intendedData?.intendedStartDate)
        : moment().add(config.minDaysUntilMobileEventStart, 'days'),
      contactInformation: intendedData?.contactInformation,
      workingTimeStart: moment(),
      workingTimeEnd: moment().add(1, 'hours'),
      province: intendedData?.province,
      minParticipant: intendedData?.minParticipant,
      maxParticipant: intendedData?.maxParticipant,
      selectedDistricts: intendedData?.selectedDistricts
        .map((district) => `${district?.name} (${district?.count})`)
        .join(', '),
    }),
    [intendedData]
  );
  const maxDateProps = {
    if(intendedData) {
      maxDateProps.maxDate = moment(intendedData?.intendedEndDate);
    },
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

      if (minParticipant < maxParticipant) clearErrors(['minParticipant', 'maxParticipant']);

      return minParticipant < maxParticipant || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validDateBaseOnCurrentDate', function (errorMessage) {
    return this.test(`test-valid-date-base-on-now`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const beginEvent = context.parent.beginEvent;

      if (intendedData) return true;

      return (
        moment().add(config.minDaysUntilMobileEventStart, 'days').isSameOrBefore(moment(beginEvent), 'dates') ||
        createError({ path, message: errorMessage })
      );
    });
  });

  Yup.addMethod(Yup.date, 'isInPeriodOfIntendedDate', function (errorMessage) {
    return this.test(`test-valid-period-date`, errorMessage, function (value, context) {
      const { path, createError } = this;

      if (!intendedData) return true;
      return (
        (moment(value).isSameOrAfter(moment(intendedData?.intendedStartDate), 'dates') &&
          moment(value).isSameOrBefore(moment(intendedData?.intendedEndDate), 'dates')) ||
        createError({ path, message: errorMessage })
      );
    });
  });

  Yup.addMethod(Yup.date, 'validateStartDate', function (errorMessage) {
    return this.test(`test-valid-date-base-on-now`, errorMessage, function (value, context) {
      const { path, createError } = this;

      if (!intendedData) return true;

      return (
        moment()
          .add(config.minDaysUntilMobileEventFromIntendedEventStart, 'days')
          .isSameOrBefore(moment(value), 'dates') || createError({ path, message: errorMessage })
      );
    });
  });

  Yup.addMethod(Yup.number, 'validateOverMaxParticipation', function (errorMessage) {
    return this.test(`test-valid-over-max-participation`, errorMessage, function (value, context) {
      const { path, createError } = this;

      if (!intendedData) return true;

      return intendedData?.totalRegistrations <= value || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validateDurationStartAndCurrentDate', function (errorMessage) {
    return this.test(`test-current-start-date-duration`, errorMessage, function (value, context) {
      const { path, createError } = this;

      const diff = moment(value).diff(moment(), 'days');

      return (diff >= 0 && diff <= config.maxDaysUntilEventStart) || createError({ path, message: errorMessage });
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
      .validateStartDate(
        `Ngày bắt đầu phải lớn hơn hiện tại ít nhất ${config.minDaysUntilMobileEventFromIntendedEventStart} ngày`
      )
      .validateDurationStartAndCurrentDate(
        `Không thể tạo sự kiện cách hiện tại quá ${config.maxDaysUntilEventStart} ngày`
      )
      .validDateBaseOnCurrentDate(`Ngày bắt đầu phải hơn hiện tại ít nhất ${config.minDaysUntilMobileEventStart} ngày`)
      .isInPeriodOfIntendedDate(
        `Ngày diễn ra phải nằm trong khoảng (${formatDate(intendedData?.intendedStartDate, 2)} - ${formatDate(
          intendedData?.intendedEndDate,
          2
        )}) như đã dự kiến`
      ),
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
      .validateMinAndMax('Số người tham gia tối đa phải lớn hơn số người tham gia tối thiếu')
      .validateOverMaxParticipation('Số lượng tham gia tối đa đang ít hơn tổng người đăng ký'),
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
    selectedDistricts: Yup.string(),
  });

  const { handleSubmit, control, resetField, clearErrors, setValue } = useForm({
    resolver: yupResolver(AddEventSchema),
    defaultValues: intendedData ? intendedValues : defaultValues,
    mode: 'onChange',
  });

  const handleConfirmOpen = () => {
    setIsConfirmOpen(!isConfirmOpen);
  };

  const handleAlertOpen = () => {
    setIsAlertOpen(!isAlertOpen);
  };

  const confirmDialogContent = () => {
    return (
      <Box>
        <Typography>
          <b>Tổng người đăng ký hiện tại</b> đang thấp hơn <b>số người tối thiếu</b>. Bạn có chắc chắn muốn tạo ?{' '}
        </Typography>

        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button
            variant="contained"
            onClick={(e) => {
              handleConfirmOpen();
              isConfirmDone = !isConfirmDone;
              submitBtnRef.current.click();
            }}
          >
            Tạo
          </Button>
        </DialogButtonGroupStyle>
      </Box>
    );
  };

  const alertDialogContent = () => {
    return (
      <Box>
        <Typography>
          Các quận huyện bạn đang chọn không gần kề nhau. Bạn có chắc chắn muốn tạo sự kiện lưu động trên các quận huyện
          này ?
        </Typography>

        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button
            onClick={(e) => {
              handleAlertOpen();
              isAlertDone = false;
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={(e) => {
              handleAlertOpen();
              isAlertDone = !isAlertDone;
              submitBtnRef.current.click();
            }}
          >
            Tạo
          </Button>
        </DialogButtonGroupStyle>
      </Box>
    );
  };

  const onSubmit = async (data) => {
    if (intendedData && !isConfirmDone && data?.minParticipant > intendedData?.totalRegistrations) {
      handleConfirmOpen();
      return;
    }

    if (
      !intendedData &&
      !isAlertDone &&
      data?.province[0]?.id === 79 &&
      !areDistrictsNearby(data?.districts?.map((district) => district?.id))
    ) {
      handleAlertOpen();

      return;
    }

    setIsButtonLoading(true);

    const areas = intendedData
      ? intendedData?.selectedDistricts?.map((district) => ({
          provinceId: intendedData?.province?.id,
          districtId: district?.id,
        }))
      : data?.districts?.map((item) => ({ provinceId: data?.province[0]?.id, districtId: item?.id }));

    const mappingData = {
      name: data?.name,
      description: data?.description,
      eventType: EventTypeEnum.MobileEvent,
      imageUrls: data?.imageUrls,
      areas,
      startDate: moment(data?.beginEvent).format('yyyy-MM-DD'),
      endDate: moment(data?.beginEvent).format('yyyy-MM-DD'),
      workingTimeStart: moment(data?.workingTimeStart, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss'),
      workingTimeEnd: moment(data?.workingTimeEnd, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss'),
      contactInformation: data?.contactInformation,
      minParticipant: data?.minParticipant,
      maxParticipant: data?.maxParticipant,
      ...(intendedData && { intendedEventId: intendedData?.intendedEventId }),
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
    if (intendedData) return;
    const rawProvinces = await getAllProvinces(0);
    const mappingProvinces = rawProvinces.map((d) => ({ id: d.id, name: d.name }));

    setProvinces(mappingProvinces);
  }, []);

  const fetchDistrictsByProvinceId = useCallback(async () => {
    if (intendedData) return;
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
    listenOnHubToGetConfig(
      connection,
      (
        maxDaysEventDuration,
        maxDaysUntilEventStart,
        minDaysUntilFixedEventStart,
        minDaysUntilMobileEventStart,
        minDaysUntilMobileEventFromIntendedEventStart
      ) => {
        dispatch(
          setConfig(
            maxDaysEventDuration,
            maxDaysUntilEventStart,
            minDaysUntilFixedEventStart,
            minDaysUntilMobileEventStart,
            minDaysUntilMobileEventFromIntendedEventStart
          )
        );
      }
    );
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  useEffect(() => {
    setValue('beginEvent', moment().add(config.minDaysUntilMobileEventStart, 'days'));
  }, [config.minDaysUntilMobileEventStart]);

  useEffect(() => {
    setValue('beginEvent', moment().add(config.minDaysUntilMobileEventFromIntendedEventStart, 'days'));
  }, [config.minDaysUntilMobileEventFromIntendedEventStart]);

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
                  disabled={intendedData ? true : false}
                  label="Tỉnh thành"
                  paramsCompare="id"
                  name="province"
                  list={intendedData ? [intendedData?.province] : provinces}
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

                {intendedData && (
                  <>
                    <RHFInput
                      disabled
                      label="Quận huyện"
                      name="selectedDistricts"
                      control={control}
                      isRequiredLabel={true}
                    />

                    <Typography mb={2}>
                      Tổng người đăng ký: <b>{intendedData?.totalRegistrations}</b>
                    </Typography>
                  </>
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
                    minDate={
                      intendedData
                        ? moment().isSameOrBefore(moment(intendedData?.intendedStartDate), 'dates')
                          ? moment(intendedData?.intendedStartDate)
                          : moment().add(config.minDaysUntilMobileEventFromIntendedEventStart, 'days')
                        : minDate
                    }
                    maxDate={intendedData ? moment(intendedData?.intendedEndDate) : undefined}
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
                    <LoadingButton type="submit" loading={isButtonLoading} variant="contained" ref={submitBtnRef}>
                      Tạo
                    </LoadingButton>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </form>
      {/* Confirm Dialog */}
      <CustomDialog
        isOpen={isConfirmOpen}
        onClose={handleConfirmOpen}
        title="Lưu ý"
        children={confirmDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important' } }}
      />

      {/* Alert Dialog */}
      <CustomDialog
        isOpen={isAlertOpen}
        onClose={handleAlertOpen}
        title="Lưu ý"
        children={alertDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important' } }}
      />
    </>
  );
};

export default React.memo(AddMobileEventForm);
