import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stack, Box, styled, Typography, Button, DialogActions, Divider, Grid } from '@mui/material';
import { CustomDialog, CustomSnackBar, RHFUploadImage, RHFImport } from 'components';
import { FiEdit2 } from 'react-icons/fi';
import { BsClock } from 'react-icons/bs';
import LoadingButton from '@mui/lab/LoadingButton';
import { errorHandler, convertDayLabel } from 'utils';
import { useForm } from 'react-hook-form';
import { AiOutlineDownload } from 'react-icons/ai';
import { ref, getDownloadURL, getStorage, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { storage } from 'config/firebaseConfig';
import moment from 'moment';
import { getHospitalById, editHospital } from 'api';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_HOSPITAL_IMAGE_URL } from 'utils';

const TitleStyle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: '600',
}));

const HospitalImgStyle = styled(Box)(({ theme }) => ({
  width: '200px',
  height: '200px',
  borderRadius: '100%',
  border: `2px solid ${theme.palette.primary.main}`,

  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '100%',
  },
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
const HospitalInfo = () => {
  const [isUpdateHospitalOpen, setIsUpdateHospitalOpen] = useState(false);
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [importParams, setImportParams] = useState([]);
  const [isImportBtnDisabled, setIsImportBtnDisabled] = useState(true);
  const [hospitalData, setHospitalData] = useState();
  const [imgUploadFile, setImgUploadFile] = useState(null);
  let user = useSelector((state) => state.auth.auth?.user);

  const { handleSubmit, control, reset } = useForm({});

  const downloadRef = useRef();

  const handleUpdateHospitalDialog = () => {
    setIsUpdateHospitalOpen(!isUpdateHospitalOpen);
    setIsImportBtnDisabled(true);
  };
  const handleUploadEventImg = (file) => {
    setImgUploadFile(file);
    if (file) {
      setIsImportBtnDisabled(false);
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
            updateHospitalHandler(data);
          });
      }
    );
  };

  const updateHospitalHandler = async (data) => {
    setAlert({});

    try {
      await editHospital(data);
      await fetchHospitalInfo();
      setAlert({
        message: 'Sửa bệnh viện thành công',
        status: true,
        type: 'success',
      });
      reset();
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      handleUpdateHospitalDialog();
      setIsButtonLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setAlert({});
    setIsButtonLoading(true);
    setImportParams([]);

    delete data.hospitalFile;
    if (importParams.length > 0) {
      data.name = importParams[0].name;
      data.address = importParams[0].address;
      data.latitude = importParams[0].latitude;
      data.longitude = importParams[0].longitude;
      data.email = importParams[0].email;
      data.phoneNumber = importParams[0].phoneNumber;
      data.openingTime = importParams[0].openingTime;
    }

    if (imgUploadFile) {
      await uploadImage(data);

      return;
    }
    setImgUploadFile(null);

    updateHospitalHandler(data);
  };

  const handleDownloadTemplate = async () => {
    getDownloadURL(ref(storage, 'template_import/hospital_import_template.csv'))
      .then((url) => {
        downloadRef.current.setAttribute('href', url);
        downloadRef.current.click();
      })
      .catch((error) => {
        switch (error.code) {
          case 'storage/object-not-found':
            setAlert({});
            setAlert({
              message: 'Không tìm thấy tệp tin để tải về, Vui lòng liên hệ quản trị viên',
              status: true,
              type: 'error',
            });
            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
          default: {
          }
        }
      });
  };

  const getDataFromFile = (values, disabledBtn) => {
    setImportParams([]);
    setImportParams(values);
    setIsImportBtnDisabled(disabledBtn);
  };
  const fetchHospitalInfo = useCallback(async () => {
    const hospitalData = await getHospitalById(user?.hospital_id);
    setHospitalData(hospitalData);
  }, []);

  useEffect(() => {
    fetchHospitalInfo();
  }, [fetchHospitalInfo]);

  const updateHospitalDialogContent = () => {
    return (
      <Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack justifyContent="center" spacing={2}>
            <RHFUploadImage
              label=""
              name="avatarUrl"
              control={control}
              onUpload={handleUploadEventImg}
              defaultValue={hospitalData?.avatarUrl}
              borderRadius="100%"
              width="220px"
              height="220px"
            />
            <RHFImport
              control={control}
              name="hospitalFile"
              label="Kéo thả hoặc nhấn vào để chọn file"
              onImport={getDataFromFile}
              isEdit={true}
            />
          </Stack>

          <DownloadLink ref={downloadRef} download />

          <Stack direction="row" justifyContent="space-between">
            <Button sx={{ width: '150px' }} startIcon={<AiOutlineDownload />} onClick={handleDownloadTemplate}>
              Tải file mẫu
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
      </Box>
    );
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Stack direction="row" justifyContent="space-between" alignContent="center">
        <TitleStyle>Thông tin bệnh viện</TitleStyle>
        <Button variant="contained" startIcon={<FiEdit2 />} onClick={handleUpdateHospitalDialog}>
          Sửa
        </Button>
      </Stack>
      <Stack direction="row" spacing={3} sx={{ marginTop: '20px' }}>
        <HospitalImgStyle>
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
        <Grid container>
          {hospitalData?.openingTime?.map((item, i) => (
            <Grid key={i} item xs={12} md={6}>
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

      {/* Cancel Event Dialog */}
      <CustomDialog
        isOpen={isUpdateHospitalOpen}
        onClose={handleUpdateHospitalDialog}
        title="Sửa thông tin bệnh viện"
        children={updateHospitalDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '700px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </Box>
  );
};

export default HospitalInfo;
