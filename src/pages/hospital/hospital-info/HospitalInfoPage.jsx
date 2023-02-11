import React, { useState, useRef, useEffect } from 'react';
import { DashedBox, HospitalImgStyle, Item, LeftContainer } from './HospitalInfoStyle';
import { Stack, Box, Typography, Button, Grid, Paper, Avatar, styled } from '@mui/material';
import { CustomDialog, CustomSnackBar, RHFUploadImage, RHFImport, Icon, HeaderBreadcumbs } from 'components';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  errorHandler,
  convertDayLabel,
  convertErrorCodeToMessage,
  HeaderMainStyle,
  DialogButtonGroupStyle,
} from 'utils';
import { useForm } from 'react-hook-form';
import { ref, getDownloadURL, getStorage, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { storage } from 'config/firebaseConfig';
import moment from 'moment';
import { editHospital, getHospitalById } from 'api';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_HOSPITAL_IMAGE_URL } from 'utils';
import { setHospital } from 'app/slices/HospitalSlice';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useParams } from 'react-router-dom';

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
  const [connection, setConnection] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.auth?.user);
  const store = useStore();
  const { hospitalId } = useParams();
  const { handleSubmit: handleSubmitHospitalInfo, control: hospitalInfoControl } = useForm({});
  const { handleSubmit: handleSubmitHospitalImg, control: hospitalImgControl } = useForm({});

  const downloadRef = useRef();

  const isAdmin = () => user?.role === 'Admin';

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
    '&:hover': { opacity: isAdmin ? 0 : 0.72 },
  }));

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
        if (hospitalData?.avatarUrl && hospitalData?.avatarUrl !== DEFAULT_HOSPITAL_IMAGE_URL) {
          const imgId = hospitalData?.avatarUrl?.split('hospital-images%2F')[1]?.split('?alt')[0];
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
      editHospital(data).then((value) => dispatch(setHospital(data)));
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
      editHospital(data).then((value) => {
        dispatch(setHospital(data));
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
              label="Kéo thả hoặc nhấn vào để gửi lên"
              onImport={getDataFromFile}
              isEdit={true}
            />
          </Stack>

          <a ref={downloadRef} style={{ display: 'hidden' }} />

          <Stack direction="row" justifyContent="space-between">
            <Button startIcon={<Icon icon="solid-file-download" />} onClick={handleDownloadInfo}>
              Tải thông tin bệnh viện
            </Button>
            <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
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
            </DialogButtonGroupStyle>
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
            <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
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
            </DialogButtonGroupStyle>
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
    downloadBlob(csv, 'hospital_info.csv', 'data:text/csv;charset=utf-8,');
  };

  const getDataFromFile = (values, disabledBtn) => {
    setImportParams([]);
    setImportParams(values);
    setIsImportBtnDisabled(disabledBtn);
  };

  const fetchHospitalInfoData = async () => {
    setHospitalData(await getHospitalById(hospitalId));
  };

  useEffect(() => {
    if (!isAdmin()) {
      const openConnection = async () => {
        setConnection(await openHubConnection(store));
      };
      openConnection();
    }
    fetchHospitalInfoData();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
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
    }
  }, [connection]);

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Thông tin bệnh viện"
          links={[
            isAdmin ? { name: 'Danh sách bệnh viện', to: '/hospital' } : { name: 'Trang chủ', to: '/' },
            { name: isAdmin ? `${hospitalData?.name}` : 'Thông tin bệnh viện' },
          ]}
        />
        {isAdmin ? (
          ''
        ) : (
          <Button
            startIcon={<Icon icon="solid-pen-line" />}
            variant="contained"
            onClick={() => handleUpdateHospitalDialog()}
          >
            Cập nhật
          </Button>
        )}
      </HeaderMainStyle>
      <Grid container spacing={2}>
        <Grid item md={8} sm={6} xs={12}>
          <Item>
            <LeftContainer>
              <HospitalImgStyle>
                <PlaceholderStyle onClick={isAdmin ? null : handleUpdateHospitalImgDialog}>
                  <Icon icon="solid-camera" />
                  <Typography variant="caption">Cập nhật ảnh</Typography>
                </PlaceholderStyle>
                <img src={hospitalData?.avatarUrl} alt="Ảnh bệnh viện" />
              </HospitalImgStyle>
              <Stack direction={'column'} alignItems="start">
                <Typography fontSize={'20px'} fontWeight={600} sx={{ mb: 0.5 }}>
                  {hospitalData?.name}
                </Typography>
                <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                  {hospitalData?.address}
                </Typography>
                <Typography fontSize={'16px'} fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                  Thông tin liên hệ
                </Typography>
                <Stack direction={'row'} flexWrap={'wrap'}>
                  <DashedBox>
                    <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                      Email
                    </Typography>
                    <Typography fontSize={'16px'} fontWeight={600}>
                      {hospitalData?.email || 'Chưa cập nhật'}
                    </Typography>
                  </DashedBox>
                  <DashedBox>
                    <Typography align="left" fontSize={'14px'} fontWeight={500} color="grey.500">
                      Số điện thoại
                    </Typography>
                    <Typography align="left" fontSize={'16px'} fontWeight={600}>
                      {hospitalData?.phoneNumber || 'Chưa cập nhật'}
                    </Typography>
                  </DashedBox>
                </Stack>
              </Stack>
            </LeftContainer>
          </Item>
        </Grid>
        <Grid item md={4} sm={6} xs={12}>
          <Item>
            <Stack direction={'row'} alignItems="center">
              <Avatar sx={{ backgroundColor: 'primary.light', color: 'primary.main', borderRadius: '50%', mr: '10px' }}>
                <Icon icon="clock" />
              </Avatar>
              <Typography fontSize={16} fontWeight={600}>
                Lịch làm việc
              </Typography>
            </Stack>
            <Stack direction={'column'} sx={{ mt: 2 }} gap={2}>
              {hospitalData?.openingTime?.map((item, i) => (
                <Stack direction={'row'} alignItems="center" justifyContent={'space-between'} key={item.id}>
                  <Typography fontWeight={600} fontSize={14}>
                    {convertDayLabel(item?.day)}
                  </Typography>
                  <Box key={item.id}>
                    {item?.isEnabled ? (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'grey.700' }} key={item.id}>
                        <Typography
                          fontSize={14}
                          sx={{
                            padding: '4px 12px',
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: '4px',
                          }}
                        >
                          {moment(item?.startTime, 'HH:mm').format('HH:mm')}
                        </Typography>
                        <Typography fontSize={14}>đến</Typography>
                        <Typography
                          fontSize={14}
                          sx={{
                            padding: '4px 12px',
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: '4px',
                          }}
                        >
                          {moment(item?.endTime, 'HH:mm').format('HH:mm')}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography fontSize={14} sx={{ color: 'error.main' }}>
                        Đóng cửa
                      </Typography>
                    )}
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Item>
        </Grid>
      </Grid>

      {/* Update Hospital Info Dialog */}
      <CustomDialog
        isOpen={isUpdateHospitalOpen}
        onClose={handleUpdateHospitalDialog}
        title="Sửa thông tin bệnh viện"
        children={updateHospitalDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '700px' } }}
      />

      {/* Update Hospital Img Dialog */}
      <CustomDialog
        isOpen={isUpdateHospitalImgOpen}
        onClose={handleUpdateHospitalImgDialog}
        title="Cập nhật ảnh bệnh viện"
        children={updateHospitalImgDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '30% !important', maxHeight: '700px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
};

export default HospitalInfoPage;
