import React, { useState, useEffect, useMemo } from 'react';
import { Stack, MenuItem, Paper, Grid, Button, Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
  RHFInput,
  RHFEditor,
  RHFAutoComplete,
  RHFDatePicker,
  RHFTimePicker,
  RHFUploadImage,
  RHFCheckbox,
  RHFAsyncAutoComplete,
} from 'components';
import { createEvent, editEvent, getLocationByPlaceId, getLocationByInput } from 'api';
import {
  MAX_INT,
  convertBloodTypeLabel,
  errorHandler,
  DEFAULT_EVENT_IMAGE_URL,
  PHONE_NUMBER_PATTERN,
  BLOOD_TYPE,
  convertErrorCodeToMessage,
  isValidTime,
  isValidDate,
} from 'utils';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytesResumable, getDownloadURL, getStorage, deleteObject } from 'firebase/storage';
import { storage } from 'config/firebaseConfig';
import moment from 'moment';
import LoadingButton from '@mui/lab/LoadingButton';
import { useNavigate, useParams } from 'react-router-dom';
import GoongMap from './GoongMap';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useSnackbar } from 'notistack';

const AddEditFixedEventForm = ({ isEdit = false, eventEditData = null }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [locations, setLocations] = useState([]);
  const [locationDetail, setLocationDetail] = useState({
    name: '',
    address: '',
    placeId: '',
    latitude: 0,
    longitude: 0,
  });
  const [imgUploadFile, setImgUploadFile] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [connection, setConnection] = useState(null);

  const store = useStore();

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
        if (isEdit && data?.imageUrls[0] !== DEFAULT_EVENT_IMAGE_URL) {
          const storage = getStorage();

          const imgId = data?.imageUrls[0]?.split('event-images%2F')[1]?.split('?alt')[0];
          const desertRef = ref(storage, `event-images/${imgId}`);
          // Delete the file
          deleteObject(desertRef)
            .then(() => {})
            .catch((error) => {
              enqueueSnackbar(errorHandler({ response: { data: { code: 10001 } } }), {
                variant: 'error',
                persist: false,
              });
            });
        }
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            data.imageUrls[0] = downloadURL;
          })
          .then(() => {
            addEditEventHandler(data);
          });
      }
    );
  };

  const onSubmit = async (data) => {
    setIsButtonLoading(true);

    data.imageUrls = isEdit ? new Array(eventEditData?.imageUrls) : new Array(DEFAULT_EVENT_IMAGE_URL);
    data.contactInformation = data.contactInformation.replace(/ +/g, '');
    data.bloodTypeNeed = data.bloodTypeNeed.length > 0 && isEmergency ? data.bloodTypeNeed : null;
    data.minParticipant = 0;
    data.maxParticipant = data.maxParticipant ? data.maxParticipant : MAX_INT;
    data.startDate = moment(data.startDate).format('yyyy-MM-DD');
    data.endDate = moment(data.endDate).format('yyyy-MM-DD');
    data.workingTimeStart = moment(data?.workingTimeStart, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss');
    data.workingTimeEnd = moment(data?.workingTimeEnd, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss');
    delete data.locations[0]['placeId'];
    data.locations[0]['latitude'] = locationDetail.latitude + '';
    data.locations[0]['longitude'] = locationDetail.longitude + '';

    if (imgUploadFile) {
      await uploadImage(data);

      return;
    }
    setImgUploadFile(null);
    addEditEventHandler(data);
  };

  const handleUploadEventImg = (file) => {
    setImgUploadFile(file);
  };

  const handleLocationSearch = async (value) => {
    if (!value) {
      return;
    }
    const sessionToken = uuidv4();
    const response = await getLocationByInput(value, sessionToken);

    const mappingResult = response?.data?.predictions?.map((item) => ({
      name: item?.structured_formatting?.main_text,
      address: item?.description,
      placeId: item?.place_id,
      latitude: 0,
      longitude: 0,
    }));

    setLocations(mappingResult);
  };

  const handleSelectLocation = async (value) => {
    const placeId = value?.placeId;
    if (!placeId) {
      return;
    }
    const sessionToken = uuidv4();

    const response = await getLocationByPlaceId(placeId, sessionToken);
    const result = response?.data?.result;

    setLocationDetail((pre) => ({
      ...pre,
      latitude: result?.geometry?.location?.lat,
      longitude: result?.geometry?.location?.lng,
    }));
  };

  const addEditEventHandler = async (param) => {
    try {
      if (isEdit) {
        const editParams = {};
        editParams['id'] = eventId;
        editParams['imageUrls'] = param.imageUrls;

        for (const [key, value] of Object.entries(dirtyFields)) {
          editParams[key] = param[key];
        }
        await editEvent(editParams);
      } else {
        await createEvent(param);
      }

      setTimeout(() => {
        navigate('/event/fixed-list');
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

  //Custom Validation
  Yup.addMethod(Yup.date, 'validTimeDuration', function (errorMessage) {
    return this.test(`test-valid-time-duration`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const workingTimeStart = moment(context.parent.workingTimeStart);
      const workingTimeEnd = moment(context.parent.workingTimeEnd);
      const duration = workingTimeEnd.diff(workingTimeStart, 'hours');

      return Math.abs(duration) >= 1 || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validDateBaseOnCurrentDate', function (errorMessage) {
    return this.test(`test-valid-date-base-on-now`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const startDate = context.parent.startDate;
      const endDate = context.parent.endDate;

      if (isEmergency) return true;

      return (
        (moment().add(1, 'days').isSameOrBefore(moment(startDate), 'dates') &&
          moment().add(1, 'days').isSameOrBefore(moment(endDate), 'dates')) ||
        createError({ path, message: errorMessage })
      );
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

  Yup.addMethod(Yup.date, 'isStartDateBeforeOrSameEndDate', function (errorMessage) {
    return this.test(`test-valid-startDate`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const startDate = moment(context.parent.startDate);
      const endDate = moment(context.parent.endDate);

      return startDate.isSameOrBefore(endDate, 'dates') || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'isEndDateAfterOrSameStartDate', function (errorMessage) {
    return this.test(`test-valid-endDate`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const startDate = moment(context.parent.startDate);
      const endDate = moment(context.parent.endDate);

      return endDate.isSameOrAfter(startDate, 'dates') || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'isStartTimeBeforeEndTime', function (errorMessage) {
    return this.test(`test-start-time-before-end-time`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const workingTimeStart = moment(context.parent.workingTimeStart);
      const workingTimeEnd = moment(context.parent.workingTimeEnd);

      return workingTimeStart.isSameOrBefore(workingTimeEnd, 'hours') || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'isEndTimeAfterStartTime', function (errorMessage) {
    return this.test(`test-end-time-after-start-time`, errorMessage, function (value, context) {
      const { path, createError } = this;
      const workingTimeStart = moment(context.parent.workingTimeStart);
      const workingTimeEnd = moment(context.parent.workingTimeEnd);

      return workingTimeEnd.isSameOrAfter(workingTimeStart, 'hours') || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.string, 'validateBlankDescription', function (errorMessage) {
    return this.test(`test-blank-description`, errorMessage, function (value, context) {
      const { path, createError } = this;

      const temp1 = value.replace('<p>', '');
      const temp2 = temp1.replace('</p>', '');
      const temp3 = temp2.replaceAll('&nbsp;', '');

      return temp3.trim() !== '' || createError({ path, message: errorMessage });
    });
  });

  Yup.addMethod(Yup.date, 'validateValidDate', function (errorMessage) {
    return this.test(`test-valid-date`, errorMessage, function (value, context) {
      const { path, createError } = this;

      return value !== 'Invalid Date' || createError({ path, message: errorMessage });
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
      .trim('Số điện thoại liên hệ không hợp lệ')
      .matches(PHONE_NUMBER_PATTERN, { message: 'Số điện thoại liên hệ không hợp lệ', excludeEmptyString: false })
      .required('Vui lòng nhập số điện thoại liên hệ'),
    startDate: Yup.date()
      .nullable()
      .transform(transformDate)
      .typeError('Ngày không hợp lệ')
      .required('Vui lòng nhập ngày bắt đầu')
      .isStartDateBeforeOrSameEndDate('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc')
      .validDateBaseOnCurrentDate('Ngày bắt đầu và ngày kết thúc phải lớn hơn hiện tại ít nhất 1 ngày')
      .validDaysDuration('Khoảng cách giữa ngày bắt đầu và ngày kết thúc là tối đa 30 ngày'),
    endDate: Yup.date()
      .nullable()
      .transform(transformDate)
      .typeError('Ngày không hợp lệ')
      .required('Vui lòng nhập ngày kết thúc')
      .isEndDateAfterOrSameStartDate('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu')
      .validDateBaseOnCurrentDate('Ngày bắt đầu và ngày kết thúc phải lớn hơn hiện tại ít nhất 1 ngày')
      .validDaysDuration('Khoảng cách giữa ngày bắt đầu và ngày kết thúc là tối đa 30 ngày'),
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
    eventCode: Yup.string().required('Vui lòng nhập mã sự kiện'),
    bloodTypeNeed: Yup.array()
      .of(
        Yup.object().shape({
          bloodType: Yup.number(),
          isRhNegative: Yup.boolean(),
        })
      )
      .transform((value) => {
        if (!value) return [];
        return value;
      })
      .min(isEmergency ? 1 : 0, 'Vui lòng chọn nhóm máu cần gấp'),
    isEmergency: Yup.boolean(),
    maxParticipant: Yup.number()
      .transform((value) => {
        if (isNaN(value)) return MAX_INT;
        return value;
      })
      .min(1, 'Vui lòng nhập số lớn hơn hoặc bằng 1')
      .max(MAX_INT, 'Số nhập vào quá lớn'),
    locations: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string(),
          address: Yup.string(),
          placeId: Yup.string(),
          latitude: Yup.number(),
          longitude: Yup.number(),
        })
      )
      .transform(function (value, originalValue) {
        if (originalValue?.length < 1 || !originalValue) return [];
        return [
          {
            name: originalValue?.name,
            address: originalValue?.address,
            placeId: originalValue?.placeId,
            latitude: originalValue?.latitude,
            longitude: originalValue?.longitude,
          },
        ];
      })
      .min(1, 'Vui lòng chọn địa điểm tổ chức'),
  });

  const defaultValues = {
    name: '',
    eventCode: '',
    description: '',
    startDate: moment().add(1, 'days'),
    endDate: moment().add(1, 'days'),
    workingTimeStart: moment(),
    workingTimeEnd: moment().add(1, 'hours'),
    bloodTypeNeed: [],
    locations: [],
    imageUrls: [DEFAULT_EVENT_IMAGE_URL],
  };

  const editDefaultValues = useMemo(
    () => ({
      name: eventEditData?.name || '',
      description: eventEditData?.description || '',
      eventCode: eventEditData?.eventCode || '',
      contactInformation: eventEditData?.contactInformation || '',
      startDate: eventEditData?.startDate,
      endDate: eventEditData?.endDate,
      workingTimeStart: moment(eventEditData?.workingTimeStart, 'HH:mm:ss').seconds(0).millisecond(0),
      workingTimeEnd: moment(eventEditData?.workingTimeEnd, 'HH:mm:ss').seconds(0).millisecond(0),
      maxParticipant: eventEditData?.maxParticipant === MAX_INT ? null : eventEditData?.maxParticipant,
      imageUrls: eventEditData?.imageUrls,
      bloodTypeNeed: eventEditData?.bloodTypeNeed || [],
      locations: eventEditData?.locations || [],
      isEmergency: eventEditData?.isEmergency,
    }),
    [eventEditData]
  );

  const {
    handleSubmit,
    control,
    reset,
    resetField,
    formState: { dirtyFields },
    setValue,
  } = useForm({
    resolver: yupResolver(AddEventSchema),
    defaultValues: isEdit && eventEditData ? editDefaultValues : defaultValues,
    mode: 'onSubmit',
  });

  const onChangeCheckBox = (newValue) => {
    if (!newValue) {
      resetField('bloodTypeNeed');
      setValue('bloodTypeNeed', null);
    }

    setIsEmergency(newValue);
  };

  const handleDragMarker = (locationValue) => {
    if (!locationValue) return;
    setValue('locations', locationValue[0], { shouldDirty: true });
    setLocations(locationValue);
  };

  const resetDatetimeField = () => {
    resetField('startDate');
    resetField('endDate');
    resetField('workingTimeStart');
    resetField('workingTimeEnd');
  };

  const minDateHandler = () => {
    return moment().add(1, 'days');
  };

  useEffect(() => {
    if (isEdit && eventEditData) {
      setLocations([]);
      setLocationDetail((pre) => ({
        ...pre,
        name: eventEditData?.locations?.name,
        address: eventEditData?.locations?.address,
        latitude: eventEditData?.locations?.latitude,
        longitude: eventEditData?.locations?.longitude,
      }));
      setLocations([eventEditData?.locations]);
      reset(editDefaultValues);
    }
    if (!isEdit) {
      setLocations([]);
      reset(defaultValues);
    }
  }, [isEdit, eventEditData]);

  useEffect(() => {
    resetDatetimeField();
  }, [isEmergency]);

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
                  defaultValue={editDefaultValues?.description}
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
                  defaultValue={editDefaultValues?.imageUrls}
                />
              </Stack>
            </Paper>
          </Grid>
          <Grid xs={12} md={6} item>
            <Paper elevation={1} sx={{ borderRadius: '20px', padding: '30px' }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ width: '75%' }}>
                    <RHFAsyncAutoComplete
                      paramsCompare="name"
                      isRequiredLabel={true}
                      name="locations"
                      label="Địa điểm"
                      list={locations}
                      control={control}
                      placeholder="Chọn địa điểm"
                      onInput={handleLocationSearch}
                      onSelect={handleSelectLocation}
                      getOptionLabel={(option) => {
                        return option?.name || '';
                      }}
                      renderOption={(props, option) => (
                        <MenuItem key={uuidv4()} value={option} {...props}>
                          <Stack>
                            <Box>
                              <Typography fontWeight="bold">{option?.name}</Typography>
                            </Box>
                            <Box>
                              <Typography
                                sx={{
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  color: 'grey.600',
                                  textOverflow: 'ellipsis',
                                  width: '90%',
                                }}
                              >
                                {option?.address}
                              </Typography>
                            </Box>
                          </Stack>
                        </MenuItem>
                      )}
                    />
                  </Box>

                  <Box sx={{ width: '25%', marginTop: '11px' }}>
                    <Button
                      onClick={() => {
                        setIsMapOpen(!isMapOpen);
                      }}
                    >
                      {isMapOpen ? 'Tắt bản đồ' : 'Mở bản đồ'}
                    </Button>
                  </Box>
                </Stack>
                {isMapOpen && (
                  <Box sx={{ width: '100%', height: '361px' }}>
                    <GoongMap locationDetail={locationDetail} onDrag={handleDragMarker} />
                  </Box>
                )}
                <Stack spacing={2} direction="row">
                  <RHFInput
                    isRequiredLabel={true}
                    disabled={isEdit}
                    name="eventCode"
                    label="Mã sự kiện"
                    control={control}
                    placeholder="Nhập mã sự kiện"
                  />
                  <RHFInput
                    isRequiredLabel={true}
                    name="contactInformation"
                    label="Số điện thoại liên hệ"
                    control={control}
                    placeholder="Nhập số điện thoại liên hệ"
                  />
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <RHFAutoComplete
                    multiple={true}
                    paramsCompare="bloodTypeId"
                    isRequiredLabel={isEmergency}
                    disabled={isEdit ? true : !isEmergency}
                    list={BLOOD_TYPE}
                    name="bloodTypeNeed"
                    label="Nhóm máu cần gấp"
                    control={control}
                    placeholder="Chọn nhóm máu"
                    getOptionLabel={(option) => convertBloodTypeLabel(option.bloodTypeId, option.isRhNegative)}
                    renderOption={(props, option) => (
                      <MenuItem key={uuidv4()} value={option} {...props}>
                        {convertBloodTypeLabel(option.bloodTypeId, option.isRhNegative)}
                      </MenuItem>
                    )}
                  />

                  <RHFCheckbox
                    disabled={isEdit}
                    control={control}
                    list={['Sự kiện khẩn cấp 24h']}
                    label=""
                    name="isEmergency"
                    onCheck={onChangeCheckBox}
                  />
                </Stack>
                {isEmergency && (
                  <Box>
                    <Typography sx={{ color: 'error.main' }}>
                      *Lưu ý: <br />- Sự kiện khẩn cấp 24h sẽ không thể chỉnh sửa. Hãy đảm bảo các thông tin là chính
                      xác.
                      <br /> - Sự kiện khẩn cấp 24h sẽ bắt đầu ngay khi tạo và kéo dài 24h.
                    </Typography>
                  </Box>
                )}
                {!isEmergency && (
                  <>
                    <Stack spacing={2} direction="row">
                      <RHFDatePicker
                        disablePast
                        disabled={isEmergency}
                        isRequiredLabel={!isEmergency}
                        name="startDate"
                        control={control}
                        label="Ngày bắt đầu"
                        placeholder="Nhập ngày bắt đầu"
                        minDate={minDateHandler()}
                      />
                      <RHFDatePicker
                        disablePast
                        disabled={isEmergency}
                        isRequiredLabel={!isEmergency}
                        name="endDate"
                        control={control}
                        label="Ngày kết thúc"
                        placeholder="Nhập ngày kết thúc"
                        minDate={minDateHandler()}
                      />
                    </Stack>

                    <Stack direction="row" spacing={2}>
                      <RHFTimePicker
                        disabled={isEmergency}
                        mask="__:__"
                        isRequiredLabel={!isEmergency}
                        name="workingTimeStart"
                        control={control}
                        label="Giờ bắt đầu"
                        placeholder="Nhập giờ bắt đầu"
                      />

                      <RHFTimePicker
                        disabled={isEmergency}
                        mask="__:__"
                        isRequiredLabel={!isEmergency}
                        name="workingTimeEnd"
                        control={control}
                        label="Giờ kết thúc"
                        placeholder="Nhập giờ kết thúc"
                      />
                    </Stack>
                  </>
                )}

                <Stack direction="row" spacing={2}>
                  <RHFInput
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
                        navigate('/event/fixed-list');
                      }}
                    >
                      Hủy
                    </Button>
                    <LoadingButton loading={isButtonLoading} type="submit" variant="contained">
                      {isEdit ? 'Cập nhật' : 'Tạo'}
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

export default React.memo(AddEditFixedEventForm);
