import React, { useState, useEffect } from 'react';
import { Stack, MenuItem, Paper, Grid } from '@mui/material';
import { CustomSnackBar } from 'components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { RHFInput, RHFEditor, RHFAutoComplete, RHFDatePicker, RHFTimePicker, UploadImage } from 'components';
import { getLocations, createEvent } from 'api';
import { DEFAULT_EVENT_URL, MAX_INT, convertBloodTypeNeedLabel } from 'utils';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from 'config/firebaseConfig';
import moment from 'moment';
import LoadingButton from '@mui/lab/LoadingButton';
import { useNavigate, useParams } from 'react-router-dom';

const AddEventSchema = Yup.object().shape({
  name: Yup.string().required('Vui lòng nhập tên').max(128, 'Tên không được dài quá 128 kí tự'),
  description: Yup.string().required('Vui lòng nhập mô tả').max(512, 'Mô tả không được dài quá 512 kí tự'),
  contactInformation: Yup.number()
    .transform((value) => (isNaN(value) ? 0 : value))
    .min(1, 'Số điện thoại không hợp lệ')
    .max(999999999999, 'Số điện thoại không hợp lệ')
    .positive('Số điện thoại không hợp lệ')
    .required('Vui lòng nhập số điện thoại liên hệ'),
  startDate: Yup.date()
    // .test((value) => {})
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
  bloodTypeNeed: Yup.array().of(
    Yup.object().shape({
      bloodType: Yup.number(),
      isRhNegative: Yup.boolean(),
    })
  ),
  maxParticipant: Yup.number()
    .transform((value) => (isNaN(value) ? 0 : value))
    .min(1, 'Vui lòng nhập số lớn hơn hoặc bằng 1')
    .max(MAX_INT, 'Số nhập vào quá lớn'),
  // .required('Vui lòng nhập số lượng tham gia tối đa'),
  // locationIDs: Yup.array()
  //   .of(Yup.string())
  //   .transform((value) => (!value ? [] : value))
  //   .min(1, 'Vui lòng chọn địa điểm tổ chức')
  //   .required('Vui lòng chọn địa điểm tổ chức'),
  locationIDs: Yup.string()
    .transform((value) => value?.id || '')
    .required('Vui lòng chọn địa điểm tổ chức'),
});

const defaultValues = {
  name: '',
  description: '',
  startDate: new Date(),
  endDate: new Date(),
  workingTimeStart: new Date(),
  workingTimeEnd: new Date(),
  bloodTypeNeed: [{ bloodType: 0, isRhNegative: true }],
  locationIDs: '',
  imageUrls: [
    'https://firebasestorage.googleapis.com/v0/b/s4life.appspot.com/o/s4life-banner-event%2Fs4life_banner.jpg?alt=media&token=781c0f9f-3ada-449d-950b-a8b40891267d',
  ],
};

const BloodTypeOptions = [
  { bloodType: 1, isRhNegative: true },
  { bloodType: 1, isRhNegative: false },
  { bloodType: 2, isRhNegative: true },
  { bloodType: 2, isRhNegative: false },
  { bloodType: 3, isRhNegative: true },
  { bloodType: 3, isRhNegative: false },
  { bloodType: 4, isRhNegative: true },
  { bloodType: 4, isRhNegative: false },
];

const AddEditForm = ({ isEdit, eventEditData }) => {
  const [locations, setLocations] = useState([]);
  const [locationParams, setLocationParams] = useState({ Page: 1, PageSize: 10, SearchKey: '' });
  const [imgUploadFile, setImgUploadFile] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

  console.log('eventEditData: ', eventEditData);
  console.log('isEdit: ', isEdit);

  const uploadImage = async (data) => {
    const filePath = `event-images/`;

    const name = imgUploadFile.name;
    const storageRef = await ref(storage, `${filePath}/${name}-${new Date().toISOString()}`);
    const metadata = {
      contentType: imgUploadFile.type,
    };
    const uploadTask = uploadBytesResumable(storageRef, imgUploadFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {},
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            data.imageUrls[0] = downloadURL;
            data.contactInformation = data.contactInformation + '';
            data.bloodTypeNeed = data.bloodTypeNeed[0].bloodType !== 0 ? data.bloodTypeNeed : null;
            data.minParticipant = 0;
            data.maxParticipant = data.maxParticipant ? data.maxParticipant : MAX_INT;
            data.permanentEventType = 1;
            data.locationIDs = new Array(data.locationIDs);
            data.workingTimeStart = moment(data?.workingTimeStart, 'HH:mm:ss').format('HH:mm:ss');
            data.workingTimeEnd = moment(data?.workingTimeEnd, 'HH:mm:ss').format('HH:mm:ss');
          })
          .then(() => {
            addEventHandler(data);
          });
      }
    );
  };

  const onSubmit = async (data) => {
    setIsButtonLoading(true);
    try {
      if (imgUploadFile) {
        await uploadImage(data);

        return;
      }
      setImgUploadFile(null);
      data.imageUrls[0] = DEFAULT_EVENT_URL;
      data.contactInformation = data.contactInformation + '';
      data.bloodTypeNeed = data.bloodTypeNeed[0].bloodType !== 0 ? data.bloodTypeNeed : null;
      data.minParticipant = 0;
      data.maxParticipant = data.maxParticipant ? data.maxParticipant : MAX_INT;
      data.permanentEventType = 1;
      data.locationIDs = new Array(data.locationIDs);
      data.workingTimeStart = moment(data?.workingTimeStart, 'HH:mm:ss').format('HH:mm:ss');
      data.workingTimeEnd = moment(data?.workingTimeEnd, 'HH:mm:ss').format('HH:mm:ss');

      addEventHandler(data);
    } catch (err) {
      console.log(err);
    }
  };

  const getLocationsData = async () => {
    const data = await getLocations(locationParams);
    setLocations(data.items);
  };

  const getMoreLocations = async (params) => {
    const data = await getLocations(params);
    setLocations(data.items);
  };

  const handleUploadEventImg = (file) => {
    setImgUploadFile(file);
  };

  const addEventHandler = async (param) => {
    try {
      setAlert({});
      await createEvent(param);
      setAlert({ message: `Thêm bệnh viện thành công`, status: true, type: 'success' });
      setIsButtonLoading(false);

      setTimeout(() => {
        navigate('/event/list');
      }, [1500]);
    } catch (e) {}
  };

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(AddEventSchema),
    defaultValues: isEdit ? eventEditData : defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    try {
      getLocationsData();
    } catch (err) {}
  }, []);

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
                <Stack spacing={2} direction="row">
                  <RHFInput
                    isRequiredLabel={true}
                    name="eventCode"
                    label="Mã sự kiện"
                    control={control}
                    placeholder="Nhập mã sự kiện"
                  />
                  <RHFInput
                    isRequiredLabel={true}
                    name="contactInformation"
                    type="number"
                    label="Số điện thoại liên hệ"
                    control={control}
                    placeholder="Nhập số điện thoại liên hệ"
                  />
                </Stack>

                <RHFAutoComplete
                  multiple
                  isLazyLoad={false}
                  onScrollToBottom={() => {}}
                  list={BloodTypeOptions}
                  name="bloodTypeNeed"
                  label="Nhóm máu cần gấp"
                  control={control}
                  placeholder="Chọn nhóm máu"
                  getOptionLabel={(option) => convertBloodTypeNeedLabel(option.bloodType, option.isRhNegative) || ''}
                  renderOption={(props, option) => (
                    <MenuItem key={uuidv4()} value={option} {...props}>
                      {convertBloodTypeNeedLabel(option.bloodType, option.isRhNegative)}
                    </MenuItem>
                  )}
                />

                <RHFAutoComplete
                  isRequiredLabel={true}
                  isLazyLoad={true}
                  list={locations}
                  name="locationIDs"
                  label="Địa điểm tổ chức"
                  control={control}
                  onScrollToBottom={getMoreLocations}
                  placeholder="Chọn địa điểm tổ chức"
                  getOptionLabel={(option) => option.name || ''}
                />

                <UploadImage label="Ảnh sự kiện" name="imageUrls" control={control} onUpload={handleUploadEventImg} />
              </Stack>
            </Paper>
          </Grid>
          <Grid xs={12} md={6} item>
            <Paper elevation={1} sx={{ borderRadius: '20px', padding: '30px' }}>
              <Stack spacing={2}>
                <Stack spacing={2} direction="row">
                  <RHFDatePicker
                    disablePast
                    isRequiredLabel={true}
                    defaultValue={eventEditData?.startDate}
                    name="startDate"
                    control={control}
                    label="Ngày bắt đầu"
                    placeholder="Nhập ngày bắt đầu"
                  />
                  <RHFDatePicker
                    disablePast
                    defaultValue={eventEditData?.endDate}
                    isRequiredLabel={true}
                    name="endDate"
                    control={control}
                    label="Ngày kết thúc"
                    placeholder="Nhập ngày kết thúc"
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <RHFTimePicker
                    isRequiredLabel={true}
                    name="workingTimeStart"
                    control={control}
                    label="Giờ bắt đầu"
                    placeholder="Nhập giờ bắt đầu"
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

                <Stack>
                  <LoadingButton
                    loading={isButtonLoading}
                    type="submit"
                    variant="contained"
                    sx={{ width: '100px', marginLeft: 'auto' }}
                  >
                    thêm
                  </LoadingButton>
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
