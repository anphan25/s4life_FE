import React, { useState, useEffect } from 'react';
import { DashedBox, HospitalImgStyle, Item, LeftContainer } from './HospitalInfoStyle';
import { Stack, Box, Typography, Button, Grid, Paper, Avatar, styled, CircularProgress } from '@mui/material';
import { CustomDialog, RHFUploadImage, Icon, HeaderBreadcumbs } from 'components';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  errorHandler,
  convertDayLabel,
  convertErrorCodeToMessage,
  HeaderMainStyle,
  DialogButtonGroupStyle,
  RoleEnum,
  restructureHospitalSchedule,
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
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const HospitalInfoPage = () => {
  const [isUpdateHospitalImgOpen, setIsUpdateHospitalImgOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isUpdateImgBtnDisabled, setIsUpdateImgBtnDisabled] = useState(true);
  const [imgUploadFile, setImgUploadFile] = useState(null);
  const [connection, setConnection] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.auth?.user);
  const store = useStore();
  const { hospitalId } = useParams();
  const { handleSubmit: handleSubmitHospitalImg, control: hospitalImgControl } = useForm({});
  const [isCurrentSchedule, setIsCurrentSchedule] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const navigate = useNavigate();

  const isManager = user.role === RoleEnum.Manager.name;

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
    '&:hover': { opacity: !isManager ? 0 : 0.72 },
  }));

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

  const updateHospitalImgHandler = async (data) => {
    setImgUploadFile(null);

    try {
      await editHospital(data);
      dispatch(setHospital(data));
      await fetchHospitalInfoData();
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
      handleUpdateHospitalImgDialog();
    }
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

  const onSubmitHospitalImg = async (data) => {
    if (!imgUploadFile) return;

    setIsButtonLoading(true);
    await uploadImage(data);
  };

  const fetchHospitalInfoData = async () => {
    setIsPageLoading(true);
    setHospitalData(await getHospitalById(hospitalId));
    setIsPageLoading(false);
  };

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
    fetchHospitalInfoData();
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
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Thông tin bệnh viện"
          links={[
            user?.role === 'Admin' ? { name: 'Danh sách bệnh viện', to: '/hospital' } : { name: 'Trang chủ', to: '/' },
            { name: user?.role === 'Admin' ? `${hospitalData?.name}` : 'Thông tin bệnh viện' },
          ]}
        />

        {isManager && (
          <Button
            startIcon={<Icon icon="solid-pen-line" />}
            variant="contained"
            onClick={() => {
              navigate(`/hospital/${hospitalId}/edit`);
            }}
          >
            Cập nhật
          </Button>
        )}
      </HeaderMainStyle>
      {isPageLoading ? (
        <Paper sx={{ height: '65vh', position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          <Grid item md={8} sm={6} xs={12}>
            <Item>
              <LeftContainer>
                <HospitalImgStyle>
                  <PlaceholderStyle onClick={isManager && handleUpdateHospitalImgDialog}>
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
            <Item sx={{ textAlign: 'left' }}>
              <Stack direction={'row'} alignItems="center">
                <Avatar
                  sx={{ backgroundColor: 'primary.light', color: 'primary.main', borderRadius: '50%', mr: '10px' }}
                >
                  <Icon icon="clock" />
                </Avatar>
                <Typography fontSize={16} fontWeight={600}>
                  Lịch lấy máu tuần {isCurrentSchedule ? 'này' : 'sau'}
                </Typography>
              </Stack>
              <Stack direction={'column'} sx={{ mt: 2 }} gap={2}>
                {restructureHospitalSchedule(
                  isCurrentSchedule ? hospitalData?.openingTime : hospitalData?.nextWeekSchedule
                )?.map((item, i) => (
                  <Stack direction={'row'} alignItems="center" justifyContent={'space-between'} key={i}>
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
            <Stack justifyContent={isCurrentSchedule ? 'flex-end' : 'flex-start'} direction="row" mt={1}>
              {isCurrentSchedule ? (
                <>
                  {hospitalData?.nextWeekSchedule.length > 0 && (
                    <Button
                      fontWeight={400}
                      endIcon={<Icon icon="solid-caret-right" />}
                      onClick={() => {
                        setIsCurrentSchedule(false);
                      }}
                    >
                      Lịch tuần sau
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  fontWeight={400}
                  startIcon={<Icon icon="solid-caret-left" />}
                  onClick={() => {
                    setIsCurrentSchedule(true);
                  }}
                >
                  Lịch tuần này
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* Update Hospital Img Dialog */}
      <CustomDialog
        isOpen={isUpdateHospitalImgOpen}
        onClose={handleUpdateHospitalImgDialog}
        title="Cập nhật ảnh bệnh viện"
        children={updateHospitalImgDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '30% !important', maxHeight: '700px' } }}
      />
    </>
  );
};

export default HospitalInfoPage;
