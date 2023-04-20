import { Box, Typography, Button, FormControl, Select, MenuItem, Stack } from '@mui/material';
import {
  DataTable,
  CheckBoxFilter,
  FromToDateFilter,
  SearchBar,
  CustomDialog,
  Icon,
  UpdateBloodTypeImport,
  MultipleAlertSnackBar,
  DetailAlertDialog,
  RegistrationStatusTag,
} from 'components';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  errorHandler,
  formatDate,
  UserInformationUpdateModeEnum,
  convertErrorCodeToMessage,
  getEnumDescriptionByValue,
} from 'utils';
import { useParams } from 'react-router-dom';
import { getEventRegistrations, updateUserInfo, getEventRegistrationById } from 'api';
import moment from 'moment';
import { GridActionsCellItem } from '@mui/x-data-grid';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  BLOOD_TYPE,
  convertBloodTypeLabel,
  DialogButtonGroupStyle,
  InputFilterSectionStyle,
  BloodTypeFilterEnum,
  handleDownloadTemplate,
  BloodTypeEnum,
  EventRegistrationStatusEnum,
  getValuesFromEnum,
  formatPhoneNumber,
  EventRegistrationOperationEnum,
  RoleEnum,
  DownloadLink,
} from 'utils';
import { useSelector } from 'react-redux';
import { openHubConnection, listenOnHubInBulkOperations, listenOnHubToGetContent } from 'config';
import { useStore } from 'react-redux';
import { useSnackbar } from 'notistack';
import useResponsive from 'hooks/useResponsive';
import * as XLSX from 'xlsx';

const VolunteerListOfEvent = ({ isIntendedEvent, onViewRegistrationArea }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { eventId } = useParams();
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    status: '',
    searchPhoneNumber: '',
    dateFrom: null,
    dateTo: null,
    bloodTypes: [],
  });

  const [isUpdateBloodTypeDialogOpen, setIsUpdateBloodTypeDialogOpen] = useState(false);
  const [isImportBloodTypeDialogOpen, setIsImportBloodTypeDialogOpen] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [bloodType, setBloodType] = useState('');
  const [importParams, setImportParams] = useState([]);
  const [isImportBtnDisabled, setIsImportBtnDisabled] = useState(true);
  const [updateBloodTypeParams, setUpdateBloodTypeParams] = useState({
    userInformationId: '',
    bloodTypeId: '',
    isRhNegative: '',
    nationalId: '',
  });
  const [isMultipleAlertOpen, setIsMultipleAlertOpen] = useState(false);
  const [alertResult, setAlertResult] = useState(null);
  const [isDetailAlertOpen, setIsDetailAlertOpen] = useState(false);
  const [connection, setConnection] = useState(null);
  // To prevent select/filter when calling apis
  const [disableOperation, setDisableOperation] = useState(false);

  let user = useSelector((state) => state.auth.auth?.user);

  const isEmployee = user.role === RoleEnum.Employee.name;
  const isManager = user.role === RoleEnum.Manager.name;
  const isAdmin = user.role === RoleEnum.Admin.name;
  const isModerator = user.role === RoleEnum.Moderator.name;

  const store = useStore();

  const downloadRef = useRef();

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
        headerName: 'Tên',
        field: 'fullName',
        type: 'string',
        minWidth: 200,
        flex: 1,
      },

      {
        headerName: 'CCCD/CMND',
        field: 'cccdcmnd',
        type: 'string',
        width: 130,
      },
      {
        headerName: 'Số điện thoại',
        field: 'phoneNumber',
        type: 'string',
        width: 120,
      },
      {
        headerName: 'Nhóm máu',
        field: 'bloodType',
        type: 'string',
        width: 100,
      },
      {
        headerName: 'Số lượng hiến (ml)',
        field: 'donationVolume',
        type: 'number',
        width: 130,
      },
      {
        headerName: 'Ngày tham gia',
        field: 'participationDate',
        type: 'string',
        hide: isIntendedEvent,
        width: 120,
      },
      {
        headerName: 'Trạng thái',
        field: 'statusId',
        type: 'string',
        align: 'center',
        width: 150,
        renderCell: ({ value }) => {
          return (
            <RegistrationStatusTag status={value}>
              {getEnumDescriptionByValue(EventRegistrationStatusEnum, value)}
            </RegistrationStatusTag>
          );
        },
      },
      {
        field: 'actions',
        type: 'actions',
        hide: isAdmin || isModerator,
        width: 50,
        sortable: false,
        filterable: false,
        align: 'center',
        ...((isManager || isEmployee) && {
          getActions: (params) => [
            <GridActionsCellItem
              label="Cập nhật nhóm máu"
              disabled={params.row.statusId !== EventRegistrationStatusEnum.Donated.value || !isEmployee}
              icon={<Icon sx={{ color: 'warning.main' }} icon="solid-user-edit" />}
              onClick={() => {
                setBloodType('');
                setUpdateBloodTypeParams({
                  userInformationId: '',
                  bloodTypeId: '',
                  isRhNegative: '',
                  nationalId: '',
                });

                if (params.row.bloodTypeId != null) {
                  setBloodType(
                    JSON.stringify({ bloodTypeId: params.row.bloodTypeId, isRhNegative: params.row.isRhNegative })
                  );

                  setUpdateBloodTypeParams((old) => ({
                    ...old,
                    bloodTypeId: params.row.bloodTypeId,
                    isRhNegative: params.row.isRhNegative,
                  }));
                }
                setUpdateBloodTypeParams((old) => ({
                  ...old,
                  userInformationId: params.row.userInformationId,
                  nationalId: params.row.nationalId,
                }));
                handleUpdateBloodTypeDialog();
              }}
              showInMenu
            />,
            <GridActionsCellItem
              disabled={
                params.row.statusId !== EventRegistrationStatusEnum.Donated.value &&
                params.row.statusId !== EventRegistrationStatusEnum.ConditionInsufficient.value
              }
              icon={<Icon sx={{ color: 'success.main' }} icon="solid-folder-download" className="action-icon" />}
              label="Tải phiếu đăng ký"
              showInMenu
              onClick={async () => {
                enqueueSnackbar('Tiến hành xử lý yêu cầu', {
                  variant: 'info',
                  persist: false,
                });
                await getEventRegistrationById(params.row.id, EventRegistrationOperationEnum.GetLink);
              }}
            />,
          ],
        }),
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

  const handleFilterEventRegistration = (values) => {
    setPageState((old) => ({ ...old, status: values.join(','), page: 1 }));
  };

  const handleFilterBloodType = (values) => {
    setPageState((old) => ({ ...old, bloodTypes: values.join(','), page: 1 }));
  };

  const handleFromToDateFilter = (params) => {
    setPageState((old) => ({ ...old, page: 1, dateFrom: params.startDate, dateTo: params.endDate }));
  };

  const handleSearchVolunteerPhoneNumber = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchPhoneNumber: searchValue.searchTerm }));
  };

  const handleUpdateBloodTypeDialog = () => {
    setIsUpdateBloodTypeDialogOpen(!isUpdateBloodTypeDialogOpen);
  };

  const handleImportBloodTypeDialog = () => {
    setIsImportBloodTypeDialogOpen(!isImportBloodTypeDialogOpen);
    setIsImportBtnDisabled(true);
  };

  const handleDetailAlertDialog = () => {
    setIsDetailAlertOpen(!isDetailAlertOpen);
  };

  const handleExportListOfAttendant = async () => {
    setIsButtonLoading(true);

    try {
      const data = await getEventRegistrations({
        EventId: eventId,
        Status: `${EventRegistrationStatusEnum.Donated.value}, ${EventRegistrationStatusEnum.ConditionInsufficient.value}`,
        Page: 1,
        PageSize: pageState.total,
      });

      const mappingData = data?.items?.map((item) => ({
        fullName: item?.fullName || '-',
        cmndcccd: item?.nationalId || '-',
        phoneNumber: formatPhoneNumber(item?.phoneNumber),
        bloodType: item?.bloodTypeId ? convertBloodTypeLabel(item?.bloodTypeId, item?.isRhNegative) : '-',
        donationVolume: item?.donationVolume || '-',
        participationDate: formatDate(item?.participationDate, 2) || '-',
        status: item?.statusName || '-',
      }));

      const headers = [
        'Tên',
        'CCCD/CMND',
        'Số điện thoại',
        'Nhóm máu',
        'Số lượng hiến (ml)',
        'Ngày tham gia',
        'Trạng thái',
      ];

      const arrData = mappingData?.map((item) => [
        item?.fullName,
        item?.cmndcccd,
        item?.phoneNumber,
        item?.bloodType,
        item?.donationVolume,
        item?.participationDate,
        item?.status,
      ]);

      const final = [headers, ...arrData];

      const wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(final);

      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, 'danh_sach_nguoi_tham_gia.xlsx');
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const updateBloodTypeDialogContent = () => {
    return (
      <Box>
        <Typography sx={{ marginBottom: '10px' }}>Chọn nhóm máu bạn muốn cập nhật</Typography>

        <Box>
          <FormControl fullWidth>
            <Select
              value={bloodType || ''}
              onChange={(e, newValue) => {
                setBloodType(e.target.value);
                setUpdateBloodTypeParams((old) => ({
                  ...old,
                  bloodTypeId: JSON.parse(e.target.value).bloodTypeId,
                  isRhNegative: JSON.parse(e.target.value).isRhNegative,
                }));
              }}
            >
              {BLOOD_TYPE.map((option, i) => (
                <MenuItem key={i} value={JSON.stringify(option)}>
                  {convertBloodTypeLabel(option.bloodTypeId, option.isRhNegative)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button onClick={handleUpdateBloodTypeDialog}>Hủy</Button>
          <LoadingButton
            disabled={bloodType ? false : true}
            loading={isButtonLoading}
            onClick={async () => {
              setIsButtonLoading(true);
              try {
                await updateUserInfo({
                  userInformationId: updateBloodTypeParams.userInformationId,
                  updateMode: UserInformationUpdateModeEnum.BloodTypeFilling,
                  volunteerBloodTypeUpdationInformations: [
                    {
                      eventId: eventId,
                      bloodType: updateBloodTypeParams.bloodTypeId,
                      isRhNegative: updateBloodTypeParams.isRhNegative,
                      nationalId: updateBloodTypeParams.nationalId,
                    },
                  ],
                });
              } catch (error) {
                enqueueSnackbar(errorHandler(error), {
                  variant: 'error',
                  persist: false,
                });
              } finally {
                handleUpdateBloodTypeDialog();
                setIsButtonLoading(false);
                setBloodType('');
                setUpdateBloodTypeParams({
                  userInformationId: '',
                  bloodTypeId: '',
                  isRhNegative: '',
                });
              }
            }}
            variant="contained"
            autoFocus
          >
            Cập nhật
          </LoadingButton>
        </DialogButtonGroupStyle>
      </Box>
    );
  };

  const getDataFromFile = (values, disabledBtn) => {
    setImportParams([]);
    setImportParams(values);
    setIsImportBtnDisabled(disabledBtn);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (importParams.length <= 0) {
      return;
    }
    setIsButtonLoading(true);
    setImportParams([]);

    const importParamsWithEventId = importParams?.map((item, i) => ({
      ...item,
      isRhNegative: item?.isRhNegative === '-',
      eventId,
    }));

    try {
      await updateUserInfo({
        userInformationId: updateBloodTypeParams.userInformationId,
        updateMode: UserInformationUpdateModeEnum.BloodTypeFilling,
        volunteerBloodTypeUpdationInformations: importParamsWithEventId,
      });
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      handleImportBloodTypeDialog();
      setIsButtonLoading(false);
    }
  };

  const importBloodTypeDialogContent = () => {
    return (
      <form onSubmit={onSubmit}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          <UpdateBloodTypeImport label="Kéo thả hoặc nhấn vào để chọn file" onImport={getDataFromFile} />

          <DownloadLink ref={downloadRef} download />
          <Stack direction="row" justifyContent="space-between">
            <Button
              sx={{ width: '150px' }}
              startIcon={<Icon icon="solid-file-download" />}
              onClick={async () => {
                try {
                  await handleDownloadTemplate('template_import/update_bloodtype_import_template.csv', downloadRef);
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
                <Button className="dialog_button" onClick={handleImportBloodTypeDialog}>
                  Hủy
                </Button>
              </Box>
              <LoadingButton
                loading={isButtonLoading}
                disabled={isImportBtnDisabled}
                className="dialog_button"
                type="submit"
                variant="contained"
              >
                Cập nhật
              </LoadingButton>
            </DialogButtonGroupStyle>
          </Stack>
        </Stack>
      </form>
    );
  };

  const fetchVolunteersOfEvent = useCallback(async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));
    setDisableOperation(true);

    try {
      const data = await getEventRegistrations({
        EventId: eventId,
        ...(pageState?.status && { Status: pageState?.status }),
        Page: pageState?.page,
        PageSize: pageState.pageSize,
        ...(pageState?.searchPhoneNumber && { SearchPhoneNumber: pageState?.searchPhoneNumber }),
        ...(pageState?.dateFrom && {
          DateFrom: pageState?.dateFrom ? moment(pageState?.dateFrom).format('yyyy-MM-DD') : '',
        }),
        ...(pageState?.dateTo && { DateTo: pageState?.dateTo ? moment(pageState?.dateTo).format('yyyy-MM-DD') : '' }),
        bloodTypes: pageState?.bloodTypes,
      });

      const dataRow = data.items?.map((data, i) => ({
        no: i + 1,
        id: data?.id, //eventRegistrationId
        userInformationId: data?.userInformationId,
        fullName: data?.fullName || '-',
        nationalId: data?.nationalId || '-',
        citizenId: data?.citizenId || '-',
        cccdcmnd: (data?.citizenId ? data?.citizenId : data?.nationalId) || '-',
        phoneNumber: formatPhoneNumber(data?.phoneNumber) || '-',
        bloodType: data?.bloodTypeId ? convertBloodTypeLabel(data?.bloodTypeId, data?.isRhNegative) : '-',
        bloodTypeId: data?.bloodTypeId,
        donationVolume: data?.donationVolume || '-',
        isRhNegative: data?.isRhNegative,
        ...(!isIntendedEvent && { participationDate: formatDate(data?.participationDate, 2) || '-' }),
        statusId: data?.status,
      }));
      setPageState({ ...pageState, data: dataRow, total: data.total });
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setPageState((old) => ({ ...old, isLoading: false }));
      setDisableOperation(false);
    }
  }, [
    pageState.page,
    pageState.pageSize,
    pageState.status,
    pageState.dateFrom,
    pageState.dateTo,
    pageState.searchPhoneNumber,
    pageState.bloodTypes,
  ]);

  useEffect(() => {
    fetchVolunteersOfEvent();
  }, [fetchVolunteersOfEvent]);

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHubInBulkOperations(connection, async (result, messageCode) => {
      if (result) {
        setIsMultipleAlertOpen(false);

        const convertBloodTypeSuccessList = result?.successList?.map((data) => ({
          ...data,
          fullName: data?.fullName || '-',
          bloodType: Object.values(BloodTypeEnum).find((value) => value?.value === data?.bloodType).description,
          isRhNegative: data?.isRhNegative ? '-' : '+',
        }));

        const convertBloodTypeFailList = result?.failedList.map((data) => ({
          errorCode: data?.errorCode,
          data: {
            ...data?.data,
            fullName: data?.data?.fullName || '-',
            bloodType: Object.values(BloodTypeEnum).find((value) => value?.value === data?.data?.bloodType)
              ?.description,
            isRhNegative: data?.data?.isRhNegative ? '-' : '+',
            index: data?.index,
          },
        }));

        result['successList'] = convertBloodTypeSuccessList;
        result['failedList'] = convertBloodTypeFailList;

        setAlertResult(result);
        setIsMultipleAlertOpen(true);
      }

      if (messageCode === 8100) {
        await fetchVolunteersOfEvent();
      }
    });

    listenOnHubToGetContent(connection, (result, messageCode) => {
      if (messageCode === 14100) {
        window.open(result, '_self');
      } else {
        enqueueSnackbar(convertErrorCodeToMessage(messageCode), {
          variant: messageCode < 0 ? 'error' : 'success',
          persist: false,
        });
      }
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ marginBottom: '10px', pl: 3 }}>
          Danh sách người đăng ký
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <LoadingButton
            loading={isButtonLoading}
            startIcon={<Icon icon="solid-download-alt" />}
            onClick={handleExportListOfAttendant}
          >
            Tải xuống
          </LoadingButton>
          {isEmployee && (
            <Button
              variant="contained"
              onClick={handleImportBloodTypeDialog}
              sx={{ marginBottom: '13px', marginRight: '15px' }}
            >
              Cập nhật nhóm máu từ file
            </Button>
          )}
          {isIntendedEvent && isManager && (
            <Button
              variant="contained"
              onClick={onViewRegistrationArea}
              sx={{ marginBottom: '13px', marginRight: '15px' }}
            >
              Xem số lượng đăng ký của các quận huyện
            </Button>
          )}
        </Stack>
      </Stack>

      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <InputFilterSectionStyle>
            <FromToDateFilter
              onChange={handleFromToDateFilter}
              sx={{ width: useResponsive('down', 'md') ? '100%' : '40%' }}
            />
            <CheckBoxFilter
              options={getValuesFromEnum(BloodTypeFilterEnum)}
              sx={{ width: useResponsive('down', 'md') ? '100%' : '20%' }}
              onCheck={handleFilterBloodType}
              placeHolder="Chọn nhóm máu"
              disableOperation={disableOperation}
            />
            <CheckBoxFilter
              options={getValuesFromEnum(EventRegistrationStatusEnum)}
              sx={{ width: useResponsive('down', 'md') ? '100%' : '20%' }}
              placeHolder="Chọn trạng thái đăng ký"
              onCheck={handleFilterEventRegistration}
              disableOperation={disableOperation}
            />
            <SearchBar
              type="number"
              sx={{ width: useResponsive('down', 'md') ? '100%' : '20%' }}
              className="search-bar"
              placeholder="Nhập số điện thoại..."
              onSubmit={handleSearchVolunteerPhoneNumber}
            />
          </InputFilterSectionStyle>
        </Box>
        <DataTable
          gridOptions={gridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Box>

      {/* Update Blood Type Dialog */}
      <CustomDialog
        isOpen={isUpdateBloodTypeDialogOpen}
        onClose={handleUpdateBloodTypeDialog}
        title="Cập nhật nhóm máu"
        children={updateBloodTypeDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />

      {/* Import Blood Type Dialog */}
      <CustomDialog
        isOpen={isImportBloodTypeDialogOpen}
        onClose={handleImportBloodTypeDialog}
        title="Cập nhật nhóm máu từ file"
        children={importBloodTypeDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />

      {/* Detail alerts dialog */}
      <DetailAlertDialog
        isOpen={isDetailAlertOpen}
        onClose={handleDetailAlertDialog}
        title={'Chi tiết kết quả'}
        successList={alertResult?.successList || []}
        failedList={alertResult?.failedList || []}
        columns={[
          { name: 'Tên', field: 'fullName' },
          { name: 'CMND/CCCD', field: 'nationalId' },
          { name: 'Nhóm máu', field: 'bloodType' },
          { name: 'Yếu tố Rh', field: 'isRhNegative' },
        ]}
        sx={{ '& .MuiDialog-paper': { width: '80% !important', maxHeight: '600px' } }}
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
    </>
  );
};

export default VolunteerListOfEvent;
