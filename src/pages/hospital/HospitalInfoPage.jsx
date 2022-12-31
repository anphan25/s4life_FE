import React, { useState, useRef } from 'react';
import { Stack, Box, styled, Typography, Button, DialogActions, Divider, Grid, Paper } from '@mui/material';
import { CustomDialog, CustomSnackBar, RHFUploadImage, RHFImport } from 'components';
import { FiEdit2 } from 'react-icons/fi';
import { RiImageEditFill } from 'react-icons/ri';
import { BsClock } from 'react-icons/bs';
import LoadingButton from '@mui/lab/LoadingButton';
import { errorHandler, convertDayLabel } from 'utils';
import { useForm } from 'react-hook-form';
import { AiOutlineDownload } from 'react-icons/ai';
import { ref, getDownloadURL, getStorage, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { storage } from 'config/firebaseConfig';
import moment from 'moment';
import { editHospital } from 'api';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_HOSPITAL_IMAGE_URL } from 'utils';
import { getHospital } from 'app/slices/HospitalSlice';

const TitleStyle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: '600',
}));

const HospitalImgStyle = styled('div')(({ theme }) => ({
  width: '200px',
  height: '200px',
  borderRadius: '100%',
  padding: '10px',
  border: `1px dashed rgba(145, 158, 171, 0.32)`,
  position: 'relative',
  display: 'flex',
  cursor: 'pointer',
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',

  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '100%',
  },
}));

const PlaceholderStyle = styled('div')(({ theme }) => ({
  opacity: 0,
  width: 'calc(100% - 17px)',
  height: 'calc(100% - 17px)',
  borderRadius: '100%',
  color: theme.palette.grey[100],
  fontSize: '40px',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  zIndex: 999,
  backgroundColor: theme.palette.grey[900],
  transition: theme.transitions.create('opacity', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': { opacity: 0.72 },
}));

const TitleInfoStyle = styled('span')(({ theme }) => ({
  color: '#a1a5b7',
  fontWeight: '600',
}));

const ContentInfoStyle = styled('span')(({ theme }) => ({
  fontWeight: '600',
}));

const DialogButtonGroup = styled(DialogActions)(({ theme }) => ({
  marginTop: 'auto',
  padding: '10px 0px 10px !important',

  [theme.breakpoints.down('sm')]: {
    margin: '0 auto',
    '& .dialog_button': {
      fontSize: '10px',
    },
  },
}));

const DownloadLink = styled('a')(({ theme }) => ({
  display: 'none',
}));

const HospitalInfoPage = () => {
  const [isUpdateHospitalOpen, setIsUpdateHospitalOpen] = useState(false);
  const [isUpdateHospitalImgOpen, setIsUpdateHospitalImgOpen] = useState(false);

  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [importParams, setImportParams] = useState([]);
  const [isImportBtnDisabled, setIsImportBtnDisabled] = useState(true);
  const [isUpdateImgBtnDisabled, setIsUpdateImgBtnDisabled] = useState(true);
  const [imgUploadFile, setImgUploadFile] = useState(null);
  const dispatch = useDispatch();
  const hospitalData = useSelector((state) => state.hospital?.data);
  const user = useSelector((state) => state.auth.auth?.user);

  const { handleSubmit: handleSubmitHospitalInfo, control: hospitalInfoControl } = useForm({});
  const { handleSubmit: handleSubmitHospitalImg, control: hospitalImgControl } = useForm({});

  const downloadRef = useRef();

  const handleUpdateHospitalDialog = () => {
    setIsUpdateHospitalOpen(!isUpdateHospitalOpen);
    setIsImportBtnDisabled(true);
    setImportParams([]);
  };

  const handleUpdateHospitalImgDialog = () => {
    setIsUpdateHospitalImgOpen(!isUpdateHospitalImgOpen);
    setIsUpdateImgBtnDisabled(true);
    setImgUploadFile(null);
  };

  const handleUploadEHospitalImg = (file) => {
    setImgUploadFile(file);

    if (file) {
      setIsUpdateImgBtnDisabled(false);
    }
  };

  const uploadImage = async (data) => {
    const filePath = `hospital-images/`;

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
        const storage = getStorage();
        if (hospitalData?.avatarUrl !== DEFAULT_HOSPITAL_IMAGE_URL) {
          const imgId = hospitalData?.avatarUrl.split('hospital-images%2F')[1]?.split('?alt')[0];
          const desertRef = ref(storage, `hospital-images/${imgId}`);
          // Delete the file
          deleteObject(desertRef)
            .then(() => {})
            .catch((error) => {});
        }

        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            data.avatarUrl = downloadURL;
          })
          .then(() => {
            updateHospitalImgHandler(data);
          });
      }
    );
  };

  const updateHospitalInfoHandler = async (data) => {
    setAlert({});
    setIsButtonLoading(true);
    setImportParams([]);
    try {
      editHospital(data).then((value) => dispatch(getHospital(user?.hospital_id)));
      setAlert({
        message: 'Cập nhật thành công',
        status: true,
        type: 'success',
      });
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
      handleUpdateHospitalDialog();
    }
  };

  const updateHospitalImgHandler = async (data) => {
    setAlert({});
    setImgUploadFile(null);

    try {
      editHospital(data).then((value) => dispatch(getHospital(user?.hospital_id)));
      setAlert({
        message: 'Cập nhật thành công',
        status: true,
        type: 'success',
      });
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
      handleUpdateHospitalImgDialog();
    }
  };

  const updateHospitalDialogContent = () => {
    return (
      <Paper>
        <form onSubmit={handleSubmitHospitalInfo(onSubmitHospitalInfo)}>
          <Stack justifyContent="center" spacing={2}>
            <RHFImport
              control={hospitalInfoControl}
              name="hospitalFile"
              label="Kéo thả hoặc nhấn vào để chọn file"
              onImport={getDataFromFile}
              isEdit={true}
            />
          </Stack>

          <DownloadLink ref={downloadRef} download />

          <Stack direction="row" justifyContent="space-between">
            <Button sx={{ width: '250px' }} startIcon={<AiOutlineDownload />} onClick={handleDownloadInfo}>
              Tải thông tin bệnh viện
            </Button>
            <DialogButtonGroup sx={{ marginTop: '10px' }}>
              <Button onClick={handleUpdateHospitalDialog}>Hủy</Button>
              <LoadingButton
                loading={isButtonLoading}
                disabled={isImportBtnDisabled}
                type="submit"
                variant="contained"
                autoFocus
              >
                Cập nhật
              </LoadingButton>
            </DialogButtonGroup>
          </Stack>
        </form>
      </Paper>
    );
  };

  const updateHospitalImgDialogContent = () => {
    return (
      <Paper>
        <form onSubmit={handleSubmitHospitalImg(onSubmitHospitalImg)}>
          <Stack justifyContent="center" spacing={2}>
            <RHFUploadImage
              label=""
              name="avatarFile"
              control={hospitalImgControl}
              onUpload={handleUploadEHospitalImg}
              defaultValue={hospitalData?.avatarUrl}
              borderRadius="100%"
              width="220px"
              height="220px"
            />
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <DialogButtonGroup sx={{ marginTop: '10px' }}>
              <Button onClick={handleUpdateHospitalImgDialog}>Hủy</Button>
              <LoadingButton
                loading={isButtonLoading}
                disabled={isUpdateImgBtnDisabled}
                type="submit"
                variant="contained"
                autoFocus
              >
                Lưu
              </LoadingButton>
            </DialogButtonGroup>
          </Stack>
        </form>
      </Paper>
    );
  };

  const onSubmitHospitalInfo = async (data) => {
    if (importParams.length < 1) return;

    data.name = importParams[0].name;
    data.address = importParams[0].address;
    data.latitude = importParams[0].latitude;
    data.longitude = importParams[0].longitude;
    data.email = importParams[0].email;
    data.phoneNumber = importParams[0].phoneNumber;
    data.openingTime = importParams[0].openingTime;

    updateHospitalInfoHandler(data);
  };

  const onSubmitHospitalImg = async (data) => {
    if (!imgUploadFile) return;

    setIsButtonLoading(true);
    await uploadImage(data);
  };

  function downloadBlob(content, filename, contentType) {
    // Create a blob
    var blob = new Blob([content], { type: contentType });
    var url = URL.createObjectURL(blob);

    downloadRef.current.setAttribute('href', url);
    downloadRef.current.setAttribute('download', filename);
    downloadRef.current.click();
  }

  function arrayToCsv(data) {
    return data
      .map(
        (row) =>
          row
            .map(String) // convert every value to String
            .map((v) => v.replaceAll('"', '""')) // escape double colons
            .map((v) => `"${v}"`) // quote it
            .join(',') // comma-separated
      )
      .join('\r\n'); // rows starting on new lines
  }

  //Format to HH:mm:ss - HH:mm:ss
  const formatWorkingTimeValue = (dayObject) => {
    return `${dayObject.startTime} - ${dayObject.endTime}`;
  };

  const getWorkingTimeOfADay = (arr, day) => {
    const dayValue = arr.find((d) => d.day === day);

    if (!dayValue.isEnabled) return '';

    return formatWorkingTimeValue(dayValue);
  };

  const handleDownloadInfo = () => {
    //Init data
    const arrData = [
      [
        'Tên*',
        'Ðịa Chỉ*',
        'Kinh Ðộ*',
        'Vĩ Ðộ*',
        'Số Ðiện Thoại*',
        'Email',
        'Thứ 2',
        'Thứ 3',
        'Thứ 4',
        'Thứ 5',
        'Thứ 6',
        'Thứ 7',
        'Chủ Nhật',
      ],
      [
        hospitalData.name || '',
        hospitalData.address || '',
        hospitalData.longitude || '',
        hospitalData.latitude || '',
        hospitalData.phoneNumber || '',
        hospitalData.email || '',
        getWorkingTimeOfADay(hospitalData.openingTime, 1),
        getWorkingTimeOfADay(hospitalData.openingTime, 2),
        getWorkingTimeOfADay(hospitalData.openingTime, 3),
        getWorkingTimeOfADay(hospitalData.openingTime, 4),
        getWorkingTimeOfADay(hospitalData.openingTime, 5),
        getWorkingTimeOfADay(hospitalData.openingTime, 6),
        getWorkingTimeOfADay(hospitalData.openingTime, 0),
      ],
    ];

    //Convert Data to CSV
    let csv = arrayToCsv(arrData);
    //Download
    downloadBlob(csv, 'hospital_info', 'text/csv;charset=utf-8;');
  };

  const getDataFromFile = (values, disabledBtn) => {
    setImportParams([]);
    setImportParams(values);
    setIsImportBtnDisabled(disabledBtn);
  };

  return (
    <Paper sx={{ padding: '30px', borderRadius: '20px' }} elevation={1}>
      <Stack direction="row" justifyContent="space-between" alignContent="center">
        <TitleStyle>Thông tin bệnh viện</TitleStyle>
        <Button variant="contained" startIcon={<FiEdit2 />} onClick={handleUpdateHospitalDialog}>
          Sửa
        </Button>
      </Stack>
      <Stack direction="row" spacing={3} sx={{ marginTop: '20px' }}>
        <HospitalImgStyle>
          <PlaceholderStyle onClick={handleUpdateHospitalImgDialog}>
            <Box>
              <RiImageEditFill />
            </Box>
            <Typography variant="caption">Cập nhật ảnh</Typography>
          </PlaceholderStyle>
          <img src={hospitalData?.avatarUrl} alt="Ảnh bệnh viện" />
        </HospitalImgStyle>
        <Stack spacing={2}>
          <Typography>
            <TitleInfoStyle>Tên: </TitleInfoStyle>
            <ContentInfoStyle>{hospitalData?.name}</ContentInfoStyle>
          </Typography>
          <Typography>
            <TitleInfoStyle>Địa chỉ: </TitleInfoStyle>
            <ContentInfoStyle>{hospitalData?.address}</ContentInfoStyle>
          </Typography>
          <Typography>
            <TitleInfoStyle>Kinh độ: </TitleInfoStyle>
            <ContentInfoStyle>{hospitalData?.longitude}</ContentInfoStyle>
          </Typography>
          <Typography>
            <TitleInfoStyle>Vĩ độ: </TitleInfoStyle>
            <ContentInfoStyle>{hospitalData?.latitude}</ContentInfoStyle>
          </Typography>
          <Typography>
            <TitleInfoStyle>E-mail: </TitleInfoStyle>
            <ContentInfoStyle>{hospitalData?.email || '-'}</ContentInfoStyle>
          </Typography>
          <Typography>
            <TitleInfoStyle>Số điện thoại: </TitleInfoStyle>
            <ContentInfoStyle>{hospitalData?.phoneNumber}</ContentInfoStyle>
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ margin: '20px 0 20px' }} />

      {/* Working Schedule */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          '& .workingTime-schedule': {
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(252, 90, 90, 0.1)',
            color: 'rgb(252, 90, 90)',
            borderRadius: '100%',
            padding: '8px',
            marginRight: '10px',
          },
        }}
      >
        <BsClock className="workingTime-schedule" /> <Typography fontWeight="bold">Lịch làm việc</Typography>
      </Stack>

      <Box sx={{ marginTop: '15px' }}>
        <Grid container rowSpacing={2}>
          {hospitalData?.openingTime?.map((item, i) => (
            <Grid key={i} item xs={12} sm={6} md={4}>
              <Stack key={i} direction="row" spacing={4} sx={{ marginBottom: '10px' }} alignItems="center">
                <Typography fontWeight="bold">{convertDayLabel(item?.day)}:</Typography>
                <Box>
                  {item?.isEnabled ? (
                    <Stack direction="row" spacing={3} alignItems="center" sx={{ color: '#5F666F' }}>
                      <Typography sx={{ padding: '5px 10px 5px', border: '1px solid #E5E5E5', borderRadius: '5px' }}>
                        {moment(item?.startTime, 'HH:mm').format('HH:mm')}
                      </Typography>
                      <Typography>đến</Typography>
                      <Typography sx={{ padding: '5px 10px 5px', border: '1px solid #E5E5E5', borderRadius: '5px' }}>
                        {moment(item?.endTime, 'HH:mm').format('HH:mm')}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography sx={{ color: 'rgb(252, 90, 90)' }}>Đóng cửa</Typography>
                  )}
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Update Hospital Info Dialog */}
      <CustomDialog
        isOpen={isUpdateHospitalOpen}
        onClose={handleUpdateHospitalDialog}
        title="Sửa thông tin bệnh viện"
        children={updateHospitalDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '700px' } }}
      />

      {/* Update Hospital Img Dialog */}
      <CustomDialog
        isOpen={isUpdateHospitalImgOpen}
        onClose={handleUpdateHospitalImgDialog}
        title="Cập nhật ảnh bệnh viện"
        children={updateHospitalImgDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '30%', maxHeight: '700px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </Paper>
  );
};

export default HospitalInfoPage;
