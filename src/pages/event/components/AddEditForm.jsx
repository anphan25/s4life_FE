import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Stack, MenuItem, Paper, Grid, Button, Box } from '@mui/material';
import { CustomSnackBar } from 'components';
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
} from 'components';
import { getLocations, createEvent, editEvent } from 'api';
import {
  MAX_INT,
  convertBloodTypeLabel,
  errorHandler,
  DEFAULT_EVENT_IMAGE_URL,
  PHONE_NUMBER_PATTERN,
  BLOOD_TYPE,
} from 'utils';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytesResumable, getDownloadURL, getStorage, deleteObject } from 'firebase/storage';
import { storage } from 'config/firebaseConfig';
import moment from 'moment';
import LoadingButton from '@mui/lab/LoadingButton';
import { useNavigate, useParams } from 'react-router-dom';

const AddEditForm = ({ isEdit, eventEditData }) => {
  const [locations, setLocations] = useState([]);
  const [locationParams, setLocationParams] = useState({ Page: 1, PageSize: 10, SearchKey: '' });
  const [imgUploadFile, setImgUploadFile] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [startDateState, setStartDateState] = useState();

  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

  console.log('eventEditData: ', eventEditData);

  const uploadImage = async (data) => {
    const filePath = `event-images/`;

    const name = uuidv4();
    const storageRef = await ref(storage, `${filePath}/${name}`);
    const metadata = {
      contentType: imgUploadFile.type,
    };

    if (!imgUploadFile) {
      return;
    }

    const uploadTask = uploadBytesResumable(storageRef, imgUploadFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {},
      (error) => {
        console.log(error);
      },
      () => {
        if (isEdit && data?.imageUrls[0] !== DEFAULT_EVENT_IMAGE_URL) {
          const storage = getStorage();

          const imgId = data?.imageUrls[0]?.split('event-images%2F')[1]?.split('?alt')[0];
          const desertRef = ref(storage, `event-images/${imgId}`);
          // Delete the file
          deleteObject(desertRef)
            .then(() => {})
            .catch((error) => {});
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
    data.bloodTypeNeed = data.bloodTypeNeed.length > 0 ? data.bloodTypeNeed : null;
    data.minParticipant = 0;
    data.maxParticipant = data.maxParticipant ? data.maxParticipant : MAX_INT;
    data.permanentEventType = 1;
    data.locationIDs = new Array(data.locationIDs[0].id);
    data.startDate = moment(data.startDate).format('yyyy-MM-DD');
    data.endDate = moment(data.endDate).format('yyyy-MM-DD');
    data.workingTimeStart = moment(data?.workingTimeStart, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss');
    data.workingTimeEnd = moment(data?.workingTimeEnd, 'HH:mm:ss').seconds(0).millisecond(0).format('HH:mm:ss');

    if (imgUploadFile) {
      await uploadImage(data);

      return;
    }
    setImgUploadFile(null);

    console.log('dirtyField: ', dirtyFields);

    console.log('final data: ', data);

    addEditEventHandler(data);
  };

  const fetchLocationsData = useCallback(async () => {
    try {
      const data = await getLocations(locationParams);

      setLocations(
        data.items.map((item) => {
          return { id: item.id, name: item.name };
        })
      );
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    }
  }, []);

  const getMoreLocations = async (params) => {
    const data = await getLocations(params);
    setLocations(data.items);
  };

  const handleUploadEventImg = (file) => {
    setImgUploadFile(file);
  };

  const addEditEventHandler = async (param) => {
    setAlert({});

    try {
      if (isEdit) {
        const editParams = {};
        editParams['id'] = eventId;

        for (const [key, value] of Object.entries(dirtyFields)) {
          editParams[key] = param[key];
        }
        await editEvent(editParams);
      } else {
        await createEvent(param);
      }

      setAlert({
        message: isEdit ? `Sửa sự kiện thành công` : `Thêm sự kiện thành công`,
        status: true,
        type: 'success',
      });

      setTimeout(() => {
        navigate('/event/list');
      }, [1000]);
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const editDefaultValues = useMemo(
    () => ({
      name: eventEditData?.name || '',
      eventCode: eventEditData?.eventCode || '',
      contactInformation: eventEditData?.contactInformation || '',
      startDate: eventEditData?.startDate,
      endDate: eventEditData?.endDate,
      workingTimeStart: moment(eventEditData?.workingTimeStart, 'HH:mm:ss').seconds(0).millisecond(0),
      workingTimeEnd: moment(eventEditData?.workingTimeEnd, 'HH:mm:ss').seconds(0).millisecond(0),
      maxParticipant: eventEditData?.maxParticipant === MAX_INT ? null : eventEditData?.maxParticipant,
      imageUrls: eventEditData?.imageUrls,
      bloodTypeNeed: eventEditData?.bloodTypeNeed || [],
      locationIDs: eventEditData?.locationIDs || [],
      isEmergency: eventEditData?.isEmergency,
    }),
    [eventEditData]
  );

  const AddEventSchema = Yup.object().shape({
    name: Yup.string().required('Vui lòng nhập tên').max(128, 'Tên không được dài quá 128 kí tự'),
    description: Yup.string().required('Vui lòng nhập mô tả').max(512, 'Mô tả không được dài quá 512 kí tự'),
    contactInformation: Yup.string()
      .trim('Số điện thoại liên hệ không hợp lệ ')
      .matches(PHONE_NUMBER_PATTERN, { message: 'Số điện thoại liên hệ không hợp lệ', excludeEmptyString: false })
      .required('Vui lòng nhập số điện thoại liên hệ'),
    startDate: Yup.date()
      .max(Yup.ref('endDate'), 'Ngày bắt đầu phải trước ngày kết thúc')
      .required('Vui lòng nhập ngày bắt đầu'),
    endDate: Yup.date()
      .min(Yup.ref('startDate'), 'Ngày kết thúc phải trước ngày bắt đầu')
      .required('Vui lòng nhập ngày kết thúc'),
    workingTimeStart: Yup.date()
      .max(Yup.ref('workingTimeEnd'), 'Giờ bắt đầu phải trước giờ kết thúc')
      .required('Vui lòng nhập giờ bắt đầu làm việc'),
    workingTimeEnd: Yup.date()
      .min(Yup.ref('workingTimeStart'), 'Giờ kết thúc phải trước giờ bắt đầu')
      .required('Vui lòng nhập giờ kết thúc làm việc'),
    eventCode: Yup.string().required('Vui lòng nhập mã sự kiện'),
    bloodTypeNeed: Yup.array()
      .of(
        Yup.object().shape({
          bloodType: Yup.number(),
          isRhNegative: Yup.boolean(),
        })
      )
      .min(isEmergency ? 1 : 0, 'Vui lòng chọn nhóm máu cần gấp'),
    isEmergency: Yup.boolean(),
    maxParticipant: Yup.number()
      // .transform((value) => (isNaN(value) ? 0 : value))
      .transform((value) => {
        if (isNaN(value)) return MAX_INT;
        return value;
      })
      .min(1, 'Vui lòng nhập số lớn hơn hoặc bằng 1')
      .max(MAX_INT, 'Số nhập vào quá lớn'),
    locationIDs: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string().required('Vui lòng chọn địa điểm tổ chức'),
        })
      )
      .transform(function (value, originalvalue) {
        if (originalvalue?.length < 1 || originalvalue === null) return [];
        return [{ id: originalvalue?.id }];
      })
      .min(1, 'Vui lòng chọn địa điểm tổ chức'),
  });

  const defaultValues = {
    name: '',
    description: '',
    startDate: isEmergency ? moment() : moment().add(1, 'days'),
    endDate: isEmergency ? moment() : moment().add(1, 'days'),
    workingTimeStart: new Date(),
    workingTimeEnd: new Date(),
    bloodTypeNeed: [],
    locationIDs: [],
    imageUrls: [DEFAULT_EVENT_IMAGE_URL],
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { dirtyFields },
  } = useForm({
    resolver: yupResolver(AddEventSchema),
    defaultValues: isEdit ? editDefaultValues : defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onChangeCheckBox = (newValue) => {
    setIsEmergency(newValue);
  };

  const minDateHandler = () => {
    isEmergency ? moment() : moment().add(1, 'days');

    if (isEdit) {
      if (editDefaultValues.isEmergency) {
        return moment();
      }
      return moment().add(1, 'days');
    }

    if (isEmergency) {
      return moment();
    }
    return moment().add(1, 'days');
  };
  const startDateParamChange = (e, value) => {
    // console.log('start: ', e.target.value);
    console.log('hehehe');
    // setStartDateState(e.target.value);
  };

  useEffect(() => {
    if (isEdit && eventEditData) {
      reset(editDefaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, eventEditData]);

  useEffect(() => {
    fetchLocationsData();
  }, [fetchLocationsData]);

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
                  control={control}
                  placeholder="Nhập mô tả"
                  defaultValue={eventEditData?.description}
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
                    multiple
                    isRequiredLabel={isEmergency}
                    isLazyLoad={false}
                    onScrollToBottom={() => {}}
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
                    list={['Sự kiện khẩn cấp']}
                    label=""
                    name="isEmergency"
                    onCheck={onChangeCheckBox}
                  />
                </Stack>

                <RHFAutoComplete
                  isRequiredLabel={true}
                  isLazyLoad={true}
                  list={locations || []}
                  name="locationIDs"
                  label="Địa điểm tổ chức"
                  control={control}
                  onScrollToBottom={getMoreLocations}
                  placeholder="Chọn địa điểm tổ chức"
                  getOptionLabel={(option) => option.name || ''}
                  renderOption={(props, option) => (
                    <MenuItem key={uuidv4()} value={option} {...props}>
                      {option.name}
                    </MenuItem>
                  )}
                />

                <Stack spacing={2} direction="row">
                  <RHFDatePicker
                    disablePast
                    isRequiredLabel={true}
                    name="startDate"
                    control={control}
                    label="Ngày bắt đầu"
                    placeholder="Nhập ngày bắt đầu"
                    minDate={minDateHandler()}
                    onChange={(value) => {
                      setStartDateState(value);
                    }}
                  />
                  <RHFDatePicker
                    disablePast
                    isRequiredLabel={true}
                    name="endDate"
                    control={control}
                    label="Ngày kết thúc"
                    placeholder="Nhập ngày kết thúc"
                    minDate={minDateHandler()}
                    onChange={() => {}}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <RHFTimePicker
                    isRequiredLabel={true}
                    name="workingTimeStart"
                    control={control}
                    label="Giờ bắt đầu"
                    placeholder="Nhập giờ bắt đầu"
                    minTime={
                      isEmergency && moment(startDateState).isSame(moment(), 'dates') && moment().add(1, 'hours')
                    }
                    shouldDisableTime={() => {
                      return false;
                    }}
                  />

                  <RHFTimePicker
                    isRequiredLabel={true}
                    name="workingTimeEnd"
                    control={control}
                    label="Giờ kết thúc"
                    placeholder="Nhập giờ kết thúc"
                  />
                </Stack>

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
                        navigate('/event/list');
                      }}
                    >
                      Hủy
                    </Button>
                    <LoadingButton loading={isButtonLoading} type="submit" variant="contained">
                      {isEdit ? 'Cập nhật' : 'Thêm'}
                    </LoadingButton>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </form>
      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </>
  );
};

export default AddEditForm;
