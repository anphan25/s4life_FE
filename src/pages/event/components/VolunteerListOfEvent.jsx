import { Box, Typography, Button, FormControl, Select, MenuItem, Stack, styled } from '@mui/material';
import {
  DataTable,
  FilterTab,
  FromToDateFilter,
  SearchBar,
  CustomSnackBar,
  CustomDialog,
  Icon,
  AutocompleteFilter,
  UpdateBloodTypeImport,
  MultipleAlertSnackBar,
  DetailAlertDialog,
} from 'components';
import { useState, useCallback, useEffect, useRef } from 'react';
import { errorHandler, formatDate, UserInformationUpdateModeEnum, convertErrorCodeToMessage } from 'utils';
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
  getFilterTabValuesFromEnum,
  formatPhoneNumber,
  EventRegistrationOperationEnum,
  getFilterBloodTypeLabels,
  RoleEnum,
} from 'utils';
import { useSelector } from 'react-redux';
import { openHubConnection, listenOnHubInBulkOperations, listenOnHubToGetContent } from 'config';
import { useStore } from 'react-redux';

export const DownloadLink = styled('a')(({ theme }) => ({
  display: 'none',
}));

const VolunteerListOfEvent = () => {
  const { eventId } = useParams();
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    status: EventRegistrationStatusEnum.Registered.value,
    searchPhoneNumber: '',
    dateFrom: null,
    dateTo: null,
    bloodTypes: [],
  });
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
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
        minWidth: 150,
        flex: 1,
      },

      {
        headerName: 'CCCD',
        field: 'nationalId',
        type: 'string',
        width: 200,
      },
      {
        headerName: 'CMND',
        field: 'citizenId',
        type: 'string',
        width: 120,
      },
      {
        headerName: 'Số điện thoại',
        field: 'phoneNumber',
        type: 'string',
        width: 170,
      },
      {
        headerName: 'Nhóm máu',
        field: 'bloodType',
        type: 'string',
        width: 100,
      },
      {
        headerName: 'Ngày tham gia',
        field: 'participationDate',
        type: 'string',
        width: 200,
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
              disabled={pageState.status !== EventRegistrationStatusEnum.Donated.value || !isEmployee}
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
              disabled={pageState.status !== EventRegistrationStatusEnum.Donated.value}
              icon={<Icon sx={{ color: 'success.main' }} icon="solid-folder-download" className="action-icon" />}
              label="Tải phiếu đăng ký"
              showInMenu
              onClick={async () => {
                setAlert({
                  message: 'Tiến hành xử lý yêu cầu',
                  type: 'info',
                  status: true,
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

  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, status: value, page: 1 }));
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

  const handleChooseBloodType = (bloodTypes) => {
    const mappingBloodTypeValues = [];

    for (const property in BloodTypeFilterEnum) {
      if (bloodTypes.includes(BloodTypeFilterEnum[property].label)) {
        mappingBloodTypeValues.push(BloodTypeFilterEnum[property].value);
      }
    }

    const bloodTypeString = mappingBloodTypeValues.toString();

    setPageState((old) => ({ ...old, bloodTypes: bloodTypeString }));
  };

  const handleDetailAlertDialog = () => {
    setIsDetailAlertOpen(!isDetailAlertOpen);
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
              setAlert({});
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
                await fetchVolunteersOfEvent();
              } catch (error) {
                setAlert({ message: errorHandler(error), type: 'error', status: true });
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
    setAlert({});
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
      await fetchVolunteersOfEvent();
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
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

    try {
      const data = await getEventRegistrations({
        EventId: eventId,
        Status: pageState?.status,
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
        phoneNumber: formatPhoneNumber(data?.phoneNumber) || '-',
        bloodType: data?.bloodTypeId ? convertBloodTypeLabel(data?.bloodTypeId, data?.isRhNegative) : '-',
        bloodTypeId: data?.bloodTypeId,
        isRhNegative: data?.isRhNegative,
        participationDate: formatDate(data?.participationDate, 2) || '-',
      }));
      setPageState({ ...pageState, data: dataRow, total: data.total });
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setPageState((old) => ({ ...old, isLoading: false }));
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
    listenOnHubInBulkOperations(connection, (result, messageCode) => {
      if (result) {
        setIsMultipleAlertOpen(false);

        const convertBloodTypeSuccessList = result?.successList?.map((data) => ({
          ...data,
          bloodType: Object.values(BloodTypeEnum).find((value) => value.value === data.bloodType).description,
          isRhNegative: data.isRhNegative ? '-' : '+',
        }));

        const convertBloodTypeFailList = result?.failedList.map((data) => ({
          errorCode: data?.errorCode,
          data: {
            ...data.data,
            bloodType: Object.values(BloodTypeEnum).find((value) => value.value === data.data.bloodType).description,
            isRhNegative: data.data.isRhNegative ? '-' : '+',
            index: data?.index,
          },
        }));

        result['successList'] = convertBloodTypeSuccessList;
        result['failedList'] = convertBloodTypeFailList;

        setAlertResult(result);
        setIsMultipleAlertOpen(true);
      }
    });

    listenOnHubToGetContent(connection, (result, messageCode) => {
      setAlert({});
      if (messageCode === 14100) {
        window.open(result, '_self');
      } else {
        setAlert({
          message: convertErrorCodeToMessage(messageCode),
          type: messageCode < 0 ? 'error' : 'success',
          status: true,
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
        {isEmployee && (
          <Button
            variant="contained"
            onClick={handleImportBloodTypeDialog}
            sx={{ marginBottom: '13px', marginRight: '15px' }}
          >
            Cập nhật nhóm máu từ file
          </Button>
        )}
      </Stack>

      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <FilterTab
            tabs={getFilterTabValuesFromEnum(EventRegistrationStatusEnum)}
            onChangeTab={handleFilterTabChange}
            defaultValue={pageState.status}
          />

          <InputFilterSectionStyle>
            <FromToDateFilter onChange={handleFromToDateFilter} sx={{ width: '50%' }} />
            <AutocompleteFilter
              multiple
              sx={{ width: '25%' }}
              placeholder="Chọn nhóm máu"
              onSelect={handleChooseBloodType}
              list={getFilterBloodTypeLabels()}
              getOptionLabel={(option) => {
                return option || '';
              }}
            />
            <SearchBar
              type="number"
              sx={{ width: '25%' }}
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
          { name: 'CMND/CCCD', field: 'nationalId' },
          { name: 'Nhóm máu', field: 'bloodType' },
          { name: 'Yếu tố Rh', field: 'isRhNegative' },
        ]}
        sx={{ '& .MuiDialog-paper': { width: '80% !important', maxHeight: '600px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}

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
