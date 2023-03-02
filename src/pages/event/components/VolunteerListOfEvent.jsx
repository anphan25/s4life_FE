import { Box, Typography, Button, FormControl, Select, MenuItem } from '@mui/material';
import {
  DataTable,
  FilterTab,
  FromToDateFilter,
  SearchBar,
  CustomSnackBar,
  CustomDialog,
  Icon,
  AsyncAutocompleteFilter,
} from 'components';
import { useState, useCallback, useEffect } from 'react';
import { errorHandler, formatDate } from 'utils';
import { useParams } from 'react-router-dom';
import { getEventRegistrations, updateBloodType } from 'api';
import moment from 'moment';
import { GridActionsCellItem } from '@mui/x-data-grid';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  BLOOD_TYPE,
  convertBloodTypeLabel,
  DialogButtonGroupStyle,
  InputFilterSectionStyle,
  BloodTypeFilterEnum,
} from 'utils';
import { useSelector } from 'react-redux';

const filterTabValues = [
  { label: 'Chưa tham gia', value: 2 },
  { label: 'Đã tham gia', value: 3 },
  { label: 'Đã hủy đăng ký', value: 1 },
  { label: 'Không đủ điều kiện sức khỏe', value: 4 },
];

const VolunteerListOfEvent = () => {
  const { eventId } = useParams();
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    status: 2, //Cancelled = 1 ,NotYetAttended = 2, Attended = 3,
    searchPhoneNumber: '',
    dateFrom: null,
    dateTo: null,
    bloodTypes: null,
  });
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const [isUpdateBloodTypeDialogOpen, setIsUpdateBloodTypeDialogOpen] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [bloodType, setBloodType] = useState('');
  const [updateBloodTypeParams, setUpdateBloodTypeParams] = useState({
    userInformationId: '',
    bloodTypeId: '',
    isRhNegative: '',
    nationalId: '',
  });
  let user = useSelector((state) => state.auth.auth?.user);

  const BloodTypeFilterList = Object.keys(BloodTypeFilterEnum).map((key) => ({
    name: key,
    value: BloodTypeFilterEnum[key],
  }));

  const convertFilterBloodTypeLabel = (bloodTypeValue) => {
    switch (bloodTypeValue) {
      case 0:
        return 'Chưa cập nhật';
      case 1:
        return 'A+';
      case 2:
        return 'B+';
      case 3:
        return 'AB+';
      case 4:
        return '0+';
      case -1:
        return 'A-';
      case -2:
        return 'B-';
      case -3:
        return 'AB-';
      case -4:
        return 'O-';
      default:
        return 'Chưa cập nhật';
    }
  };

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
        headerName: 'CMND/CCCD',
        field: 'nationalId',
        type: 'string',
        width: 200,
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
        width: 50,
        sortable: false,
        filterable: false,
        align: 'center',
        getActions: (params) => [
          <GridActionsCellItem
            disabled={pageState.status !== 3 || user.role !== 'Manager'}
            icon={
              <Box sx={{ '& .action-icon': { color: 'warning.main' } }}>
                <Icon icon="solid-user-edit" className="action-icon" />
              </Box>
            }
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
            label="Cập nhật nhóm máu"
            showInMenu
          />,
        ],
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

  const handleChooseBloodType = (bloodTypes) => {
    const bloodTypeString = bloodTypes.map((bloodType) => bloodType.value).join(',');

    setPageState((old) => ({ ...old, bloodTypes: bloodTypeString }));
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
                await updateBloodType({
                  userInformationId: updateBloodTypeParams.userInformationId,
                  updateMode: 1,
                  volunteerBloodTypeUpdationInformations: [
                    {
                      eventId: eventId,
                      bloodType: updateBloodTypeParams.bloodTypeId,
                      isRhNegative: updateBloodTypeParams.isRhNegative,
                      nationalId: updateBloodTypeParams.nationalId,
                    },
                  ],
                });

                setAlert({ message: 'Cập nhật nhóm máu thành công', status: true, type: 'success' });
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
  const fetchVolunteersOfEvent = useCallback(async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));

    try {
      const data = await getEventRegistrations({
        EventId: eventId,
        Status: pageState?.status,
        Page: pageState?.page,
        PageSize: pageState.pageSize,
        SearchPhoneNumber: pageState?.searchPhoneNumber,
        DateFrom: pageState?.dateFrom ? moment(pageState?.dateFrom).format('yyyy-MM-DD') : '',
        DateTo: pageState?.dateTo ? moment(pageState?.dateTo).format('yyyy-MM-DD') : '',
        bloodTypes: pageState?.bloodTypes,
      });

      const dataRow = data.items?.map((data, i) => ({
        no: i + 1,
        id: data?.id, //eventRegistrationId
        userInformationId: data?.userInformationId,
        fullName: data?.fullName || '-',
        nationalId: data?.nationalId || '-',
        phoneNumber: data?.phoneNumber || '-',
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

  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: '10px', pl: 3 }}>
        Danh sách người đăng ký
      </Typography>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <FilterTab tabs={filterTabValues} onChangeTab={handleFilterTabChange} defaultValue={pageState.status} />

          <InputFilterSectionStyle>
            <FromToDateFilter onChange={handleFromToDateFilter} sx={{ width: '50%' }} />
            <AsyncAutocompleteFilter
              multiple
              sx={{ width: '25%' }}
              placeholder="Chọn nhóm máu"
              onSelect={handleChooseBloodType}
              list={BloodTypeFilterList}
              isLazyLoad={true}
              getOptionLabel={(option) => {
                return convertFilterBloodTypeLabel(option?.value) || '';
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

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
};

export default VolunteerListOfEvent;
