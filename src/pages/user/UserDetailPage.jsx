import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HeaderMainStyle, errorHandler, isValidDate, DialogButtonGroupStyle, handleDownloadTemplate } from 'utils';
import { Stack, Box, Button, Divider, IconButton, Typography, styled } from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import LoadingButton from '@mui/lab/LoadingButton';
import BloodDonationHistory from './components/BloodDonationHistory';
import {
  CustomDialog,
  RHFInput,
  RHFDatePicker,
  Icon,
  HeaderBreadcumbs,
  CustomSnackBar,
  BloodDonationHistoryImport,
} from 'components';
import UserInformation from './components/UserInformation';
import { useParams } from 'react-router-dom';
import { getUserInfoById, addBloodDonations } from 'api';
import { openHubConnection, listenOnHubInBulkOperations } from 'config';
import { useStore } from 'react-redux';

const DownloadLink = styled('a')(({ theme }) => ({
  display: 'none',
}));

const UserDetailPage = () => {
  const [connection, setConnection] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [addBloodDonation, setAddBloodDonation] = useState(false);
  const [userInfoData, setUserInfoData] = useState(null);
  const { userInformationId } = useParams();
  const [importBloodDonation, setImportBloodDonation] = useState(false);
  const [addBloodDonationOptions, setAddBloodDonationOptions] = useState(false);
  const [importParams, setImportParams] = useState([]);
  const [isImportBtnDisabled, setIsImportBtnDisabled] = useState(true);
  const downloadRef = useRef();

  const store = useStore();
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const childRef = useRef();

  const AddDonationHistorySchema = Yup.object().shape({
    bloodDonations: Yup.array().of(
      Yup.object().shape({
        donationVolume: Yup.number()
          .nullable()
          .transform((value) => {
            if (!value) return null;

            return value;
          })
          .required('Vui lòng nhập số đơn vị máu')
          .min(1, 'Vui lòng nhập số lớn hơn 0'),
        bloodBagCode: Yup.string()
          .required('Vui lòng nhập số túi máu/số chứng nhận')
          .max(32, 'Vui lòng không nhập quá 32 ký tự'),
        donationDate: Yup.date()
          .nullable()
          .transform(isValidDate)
          .typeError('Ngày không hợp lệ')
          .required('Vui lòng nhập ngày hiến'),
      })
    ),
  });
  const handleAddBloodDonationHistoryDialog = () => {
    setAddBloodDonation(!addBloodDonation);
    reset();
  };

  const handleImportBloodDonationHistoryDialog = () => {
    setImportBloodDonation(!importBloodDonation);
    setIsImportBtnDisabled(true);
  };

  const handleAddBloodDonationHistoryOptionDialog = () => {
    setAddBloodDonationOptions(!addBloodDonationOptions);
  };

  const handleAddField = () => {
    append({ donationVolume: 0, bloodBagCode: '', donationDate: null });
  };

  const onSubmitManualAdd = async (data) => {
    setIsButtonLoading(true);
    const mappingBloodDonations = data?.bloodDonations?.map((data) => ({
      ...data,
      donationDate: data?.donationDate.toISOString(),
    }));

    try {
      await addBloodDonations({ userInformationId, bloodDonations: mappingBloodDonations });

      setAlert({ message: 'Thêm lịch sử hiến máu thành công', status: true, type: 'success' });

      childRef.current.reloadDonationHistories();
      handleAddBloodDonationHistoryDialog();
      fetchUserInfo();
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const onSubmitImportAdd = async (e) => {
    e.preventDefault();
    setIsButtonLoading(true);
    try {
      await addBloodDonations({ userInformationId, bloodDonations: importParams });

      setAlert({ message: 'Thêm lịch sử hiến máu thành công', status: true, type: 'success' });

      childRef.current.reloadDonationHistories();
      handleImportBloodDonationHistoryDialog();
      fetchUserInfo();
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(AddDonationHistorySchema),
    mode: 'onChange',
    defaultValues: { bloodDonations: [{ donationVolume: 0, bloodBagCode: '', donationDate: null }] },
    reValidateMode: 'onChange',
  });

  const { fields, remove, append } = useFieldArray({
    name: 'bloodDonations',
    control,
  });

  const addBloodDonationHistoryDialogContent = () => {
    return (
      <Box>
        <Box sx={{ textAlign: 'right' }}>
          <IconButton color="primary" onClick={handleAddField} sx={{ marginLeft: 'auto' }}>
            <Icon icon="solid-plus" />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit(onSubmitManualAdd)}>
          {fields.map((item, index) => (
            <Stack direction={'row'} gap={1} key={item.id}>
              <RHFInput
                type="number"
                label="Số đơn vị máu"
                name={`bloodDonations[${index}].donationVolume`}
                control={control}
                placeholder="Nhập số đơn vị máu"
                isRequiredLabel={true}
              />
              <RHFInput
                label="Số túi máu/Số chứng nhận"
                name={`bloodDonations[${index}].bloodBagCode`}
                control={control}
                placeholder="Nhập số túi máu/số chứng nhận"
                isRequiredLabel={true}
              />
              <RHFDatePicker
                disableFuture
                label="Ngày hiến"
                name={`bloodDonations[${index}].donationDate`}
                control={control}
                placeholder="Nhập ngày hiến"
                isRequiredLabel={true}
              />

              <IconButton
                sx={{
                  width: '50px',
                  height: '50px',
                }}
                disabled={index === 0}
                color="error"
                onClick={() => {
                  console.log('index', index);
                  remove(index);
                }}
              >
                <Icon icon="minus-circle" />
              </IconButton>
            </Stack>
          ))}

          <Stack>
            <Box sx={{ marginLeft: 'auto', marginTop: '20px' }}>
              <LoadingButton type="submit" variant="contained" loading={isButtonLoading}>
                Thêm
              </LoadingButton>
            </Box>
          </Stack>
        </form>
      </Box>
    );
  };

  const getDataFromFile = (values, disabledBtn) => {
    setImportParams([]);
    setImportParams(values);
    setIsImportBtnDisabled(disabledBtn);
  };

  const importBloodDonationHistoryDialogContent = () => {
    return (
      <form onSubmit={onSubmitImportAdd}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          <BloodDonationHistoryImport label="Kéo thả hoặc nhấn vào để chọn file" onImport={getDataFromFile} />

          <DownloadLink ref={downloadRef} download />
          <Stack direction="row" justifyContent="space-between">
            <Button
              sx={{ width: '150px' }}
              startIcon={<Icon icon="solid-file-download" />}
              onClick={async () => {
                try {
                  await handleDownloadTemplate('template_import/blood_donation_import_template .csv', downloadRef);
                } catch (error) {
                  setAlert({});
                  switch (error.code) {
                    case 'storage/object-not-found':
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
                }
              }}
            >
              Tải file mẫu
            </Button>
            <DialogButtonGroupStyle>
              <Box>
                <Button onClick={handleImportBloodDonationHistoryDialog}>Hủy</Button>
              </Box>
              <LoadingButton loading={isButtonLoading} disabled={isImportBtnDisabled} type="submit" variant="contained">
                Thêm
              </LoadingButton>
            </DialogButtonGroupStyle>
          </Stack>
        </Stack>
      </form>
    );
  };

  const addBloodDonationHistoryOptionDialogContent = () => {
    return (
      <Box>
        <Stack gap={3}>
          <Button
            startIcon={<Icon icon="solid-pen-line" />}
            variant="contained"
            onClick={() => {
              handleAddBloodDonationHistoryOptionDialog();
              handleAddBloodDonationHistoryDialog();
            }}
          >
            Thêm bằng cách nhập
          </Button>
          <Stack direction="row" spacing={2} alignItems="center">
            <Divider sx={{ width: '40%' }} />
            <Typography>Hoặc</Typography>
            <Divider sx={{ width: '40%' }} />
          </Stack>

          <Button
            startIcon={<Icon icon="solid-upload-alt" />}
            variant="contained"
            onClick={() => {
              handleAddBloodDonationHistoryOptionDialog();
              handleImportBloodDonationHistoryDialog();
            }}
          >
            Thêm từ file
          </Button>
        </Stack>
      </Box>
    );
  };

  const fetchUserInfo = useCallback(async () => {
    setUserInfoData(await getUserInfoById(userInformationId));
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHubInBulkOperations(connection, (result, messageCode) => {
      console.log('result', result);
      console.log('messageCode', messageCode);
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  return (
    <Box>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Thông tin tình nguyện viên"
          links={[{ name: 'Danh sách tài khoản', to: '/user/list' }, { name: `${userInfoData?.fullName}` }]}
        />
        <Stack gap={1} direction="row">
          <Button
            startIcon={<Icon icon="solid-plus" />}
            variant="contained"
            onClick={handleAddBloodDonationHistoryOptionDialog}
          >
            Thêm lịch sử hiến máu
          </Button>
        </Stack>
      </HeaderMainStyle>

      <UserInformation userInfoData={userInfoData} />

      <Divider sx={{ margin: ' 40px 0 30px' }} />

      <BloodDonationHistory ref={childRef} userInformationId={userInformationId} />

      {/* blood donation add option dialog */}
      <CustomDialog
        isOpen={addBloodDonationOptions}
        onClose={handleAddBloodDonationHistoryOptionDialog}
        title={`Thêm lịch sử hiến máu`}
        children={addBloodDonationHistoryOptionDialogContent()}
        sx={{ '& .MuiDialog-paper': { maxWidth: '50% !important', maxHeight: '500px' } }}
      />

      {/* Add blood donation dialog */}
      <CustomDialog
        isOpen={addBloodDonation}
        onClose={handleAddBloodDonationHistoryDialog}
        title={`Thêm lịch sử hiến máu`}
        children={addBloodDonationHistoryDialogContent()}
        sx={{ '& .MuiDialog-paper': { maxWidth: '70% !important', maxHeight: '500px' } }}
      />

      {/* Import blood donation dialog */}
      <CustomDialog
        isOpen={importBloodDonation}
        onClose={handleImportBloodDonationHistoryDialog}
        title={`Thêm lịch sử hiến máu từ file`}
        children={importBloodDonationHistoryDialogContent()}
        sx={{ '& .MuiDialog-paper': { maxWidth: '70% !important', maxHeight: '500px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </Box>
  );
};

export default UserDetailPage;
