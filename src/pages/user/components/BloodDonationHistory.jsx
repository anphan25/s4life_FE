import {
  DataTable,
  FromToDateFilter,
  Icon,
  CustomDialog,
  BloodDonationHistoryImport,
  RHFInput,
  RHFDatePicker,
  MultipleAlertSnackBar,
  DetailAlertDialog,
  RHFSelect,
} from 'components';
import React, { useState, useCallback, useEffect, forwardRef, useRef } from 'react';
import { getBloodDonations } from 'api';
import moment from 'moment';
import {
  errorHandler,
  isValidDate,
  DialogButtonGroupStyle,
  handleDownloadTemplate,
  formatDate,
  InputFilterSectionStyle,
  RoleEnum,
  DownloadLink,
  BLOOD_VOLUME,
} from 'utils';
import { addBloodDonations } from 'api';
import { Stack, Box, Button, Divider, IconButton, Typography, MenuItem } from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import LoadingButton from '@mui/lab/LoadingButton';
import { useStore } from 'react-redux';
import { openHubConnection, listenOnHubInBulkOperations } from 'config';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

const BloodDonationHistory = forwardRef(({ userInformationId, fetchUserInfo }) => {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    dateFrom: null,
    dateTo: null,
  });
  const [importBloodDonation, setImportBloodDonation] = useState(false);
  const [addBloodDonationOptions, setAddBloodDonationOptions] = useState(false);
  const [addBloodDonation, setAddBloodDonation] = useState(false);
  const [isImportBtnDisabled, setIsImportBtnDisabled] = useState(true);
  const [importParams, setImportParams] = useState([]);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isMultipleAlertOpen, setIsMultipleAlertOpen] = useState(false);
  const [alertResult, setAlertResult] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isDetailAlertOpen, setIsDetailAlertOpen] = useState(false);

  const user = useSelector((state) => state.auth.auth?.user);
  const isModerator = user.role === RoleEnum.Moderator.name;

  const { enqueueSnackbar } = useSnackbar();

  const downloadRef = useRef();

  const store = useStore();

  const gridOptions = {
    columns: [
      {
        headerName: 'STT',
        field: 'no',
        width: 10,
        align: 'center',
      },
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Số đơn vị máu',
        field: 'donationVolume',
        type: 'number',
        width: 300,
      },

      {
        headerName: 'Số túi máu/Số chứng nhận',
        field: 'bloodBagCode',
        type: 'string',
        flex: 1,
        minWidth: 300,
      },
      {
        headerName: 'Ngày hiến',
        field: 'donationDate',
        type: 'string',
        width: 200,
      },
    ],
    pageState: pageState,
  };

  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };

  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, page: 1, pageSize: newPageSize }));
  };
  const handleFromToDateFilter = (params) => {
    setPageState((old) => ({ ...old, page: 1, dateFrom: params.startDate, dateTo: params.endDate }));
  };

  const handleDetailAlertDialog = () => {
    setIsDetailAlertOpen(!isDetailAlertOpen);
  };

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
  const handleAddField = () => {
    append({ donationVolume: 0, bloodBagCode: '', donationDate: null });
  };

  function transformDate(value, originalValue) {
    if (this.isType(value)) {
      return value;
    }

    return isValidDate(value);
  }

  const AddDonationHistorySchema = Yup.object().shape({
    bloodDonations: Yup.array().of(
      Yup.object().shape({
        donationVolume: Yup.number()
          .nullable()
          .transform((value) => {
            if (!value) return null;

            return value;
          })
          .required('Vui lòng chọn số đơn vị máu')
          .min(1, 'Vui lòng nhập số lớn hơn 0'),
        bloodBagCode: Yup.string()
          .required('Vui lòng nhập số túi máu/số chứng nhận')
          .max(32, 'Vui lòng không nhập quá 32 ký tự'),
        donationDate: Yup.date()
          .nullable()
          .transform(transformDate)
          .typeError('Ngày không hợp lệ')
          .required('Vui lòng nhập ngày hiến'),
      })
    ),
  });

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
              {/* <RHFInput
                type="number"
                label="Số đơn vị máu"
                name={`bloodDonations[${index}].donationVolume`}
                control={control}
                placeholder="Nhập số đơn vị máu"
                isRequiredLabel={true}
              /> */}
              <RHFSelect
                label="Số đơn vị máu"
                name={`bloodDonations[${index}].donationVolume`}
                control={control}
                placeholder="Nhập số đơn vị máu"
                isRequiredLabel={true}
              >
                {BLOOD_VOLUME.map((value, i) => (
                  <MenuItem key={i} value={value}>
                    {value}ml
                  </MenuItem>
                ))}
              </RHFSelect>
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
                  await handleDownloadTemplate('template_import/blood_donation_import_template.csv', downloadRef);
                } catch (error) {
                  switch (error.code) {
                    case 'storage/object-not-found':
                      enqueueSnackbar('Không tìm thấy tệp tin để tải về, Vui lòng liên hệ quản trị viên', {
                        variant: 'error',
                        persist: false,
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

  const getDataFromFile = (values, disabledBtn) => {
    setImportParams([]);
    setImportParams(values);
    setIsImportBtnDisabled(disabledBtn);
  };

  const onSubmitManualAdd = async (data) => {
    setIsButtonLoading(true);
    const mappingBloodDonations = data?.bloodDonations?.map((data) => ({
      ...data,
      donationDate: formatDate(data?.donationDate, 5),
    }));

    try {
      await addBloodDonations({ userInformationId, bloodDonations: mappingBloodDonations });

      fetchBloodDonationList();
      handleAddBloodDonationHistoryDialog();
      fetchUserInfo();
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const onSubmitImportAdd = async (e) => {
    e.preventDefault();
    setIsButtonLoading(true);
    try {
      await addBloodDonations({ userInformationId, bloodDonations: importParams });

      fetchBloodDonationList();
      handleImportBloodDonationHistoryDialog();
      fetchUserInfo();
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const fetchBloodDonationList = useCallback(async () => {
    const response = await getBloodDonations({
      UserInformationId: userInformationId,
      Page: pageState?.page,
      PageSize: pageState?.pageSize,
      ...(pageState?.dateFrom && { DateFrom: moment(pageState?.dateFrom).format('yyyy-MM-DD') }),
      ...(pageState?.dateTo && { DateTo: moment(pageState?.dateTo).format('yyyy-MM-DD') }),
    });

    const dataRow = response?.items?.map((data, i) => ({
      no: i + 1,
      id: data?.id,
      donationDate: formatDate(data?.donationDate, 2),
      donationVolume: data?.donationVolume || '-',
      bloodBagCode: data?.bloodBagCode || '-',
    }));

    setPageState((old) => ({ ...old, data: dataRow, total: response.total }));
  }, [pageState?.pageSize, pageState?.page, pageState?.dateFrom, pageState?.dateTo]);

  useEffect(() => {
    fetchBloodDonationList();
  }, [fetchBloodDonationList]);

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHubInBulkOperations(connection, (result, messageCode) => {
      if (result) {
        setIsMultipleAlertOpen(false);
        const formatedDateSuccessList = result?.successList.map((data) => ({
          ...data,
          donationDate: formatDate(data?.donationDate, 2),
        }));
        const formatedDateFailList = result?.failedList.map((data) => ({
          errorCode: data?.errorCode,
          data: { ...data?.data, donationDate: formatDate(data?.data?.donationDate, 2), index: data?.index },
        }));

        result['successList'] = formatedDateSuccessList;
        result['failedList'] = formatedDateFailList;

        setAlertResult(result);
        setIsMultipleAlertOpen(true);
      }
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  return (
    <>
      <Stack justifyContent="space-between" direction="row" mb={2}>
        <Typography variant="h4" sx={{ marginBottom: '10px' }}>
          Lịch sử hiến máu
        </Typography>

        {isModerator && (
          <Button
            startIcon={<Icon icon="solid-plus" />}
            variant="contained"
            onClick={handleAddBloodDonationHistoryOptionDialog}
          >
            Thêm lịch sử hiến máu
          </Button>
        )}
      </Stack>

      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <InputFilterSectionStyle>
            <FromToDateFilter onChange={handleFromToDateFilter} sx={{ width: '100%' }} />
          </InputFilterSectionStyle>
        </Box>
        <DataTable
          sx={{ paddingTop: '24px' }}
          gridOptions={gridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Box>

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
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />

      {isMultipleAlertOpen && (
        <MultipleAlertSnackBar
          onClose={() => {
            setIsMultipleAlertOpen(false);
          }}
          isOpen={isMultipleAlertOpen}
          numberOfSuccess={alertResult?.successList.length}
          numberOfFailure={alertResult?.failedList.length}
          onClick={handleDetailAlertDialog}
        />
      )}

      {/* Detail alerts dialog */}
      <DetailAlertDialog
        isOpen={isDetailAlertOpen}
        onClose={handleDetailAlertDialog}
        title={'Chi tiết kết quả'}
        successList={alertResult?.successList || []}
        failedList={alertResult?.failedList || []}
        columns={[
          { name: 'Ngày hiến', field: 'donationDate' },
          { name: 'Số đơn vị máu', field: 'donationVolume' },
          { name: 'Số túi máu', field: 'bloodBagCode' },
        ]}
        sx={{ '& .MuiDialog-paper': { width: '80% !important', maxHeight: '600px' } }}
      />
    </>
  );
});

export default React.memo(BloodDonationHistory);
