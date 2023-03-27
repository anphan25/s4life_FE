import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Stack, Button, Tooltip, Divider, Typography, MenuItem, Select, ListItemText } from '@mui/material';
import {
  DataTable,
  FilterTab,
  SearchBar,
  CustomDialog,
  HeaderBreadcumbs,
  RHFInput,
  RHFAsyncAutoComplete,
  RHFSelect,
  AsyncAutocompleteFilter,
  Icon,
  Tag,
  AccountImport,
  DetailAlertDialog,
  MultipleAlertSnackBar,
} from 'components';
import { useNavigate } from 'react-router-dom';
import {
  errorHandler,
  convertBloodTypeLabel,
  formatDate,
  InputFilterSectionStyle,
  HeaderMainStyle,
  formatPhoneNumber,
  FilterRoleEnum,
  getValuesFromEnum,
  HospitalFilterEnum,
  RoleEnum,
  DownloadLink,
  handleDownloadTemplate,
  DialogButtonGroupStyle,
  EMAIL_PATTERN,
  convertErrorCodeToMessage,
} from 'utils';
import { getUsers, getHospitalsList, addUser } from 'api';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

const StatusTagConvertLabel = (value) => {
  return value ? 'success' : 'error';
};

const UserListPage = () => {
  const navigate = useNavigate();

  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    filterMode: FilterRoleEnum.Volunteer.value,
    hospitalId: '',
  });
  const user = useSelector((state) => state.auth.auth?.user);
  const [searchParam, setSearchParam] = useState('');
  const [statusFilter, setStatusFilter] = useState(0);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [filterHospitals, setFilterHospitals] = useState([]);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [hospitalGetParam, setHospitalsGetParam] = useState({
    FilterMode: 2,
    Page: 1,
    PageSize: 10,
    SearchKey: '',
    Status: true,
  });
  const [hospitalFilterParam, setHospitalsFilterParam] = useState({
    FilterMode: 2,
    Page: 1,
    PageSize: 10,
    SearchKey: '',
  });
  const [isAddAccountOptionsOpen, setIsAddAccountOptionsOpen] = useState(false);
  const [isImportAccountOpen, setIsImportAccountOpen] = useState(false);
  const [isImportBtnDisabled, setIsImportBtnDisabled] = useState(true);
  const [importParams, setImportParams] = useState([]);
  const [isDetailAlertOpen, setIsDetailAlertOpen] = useState(false);
  const [isMultipleAlertOpen, setIsMultipleAlertOpen] = useState(false);
  const [alertResult, setAlertResult] = useState(null);
  const userStatusOption = [
    { name: 'Tất cả', value: 0 },
    { name: 'Đang hoạt động', value: 1 },
    { name: 'Vô hiệu hóa', value: 2 },
  ];

  const { enqueueSnackbar } = useSnackbar();

  const downloadRef = useRef();

  const roleSelectOption = [
    { label: RoleEnum.Employee.description, value: RoleEnum.Employee.value },
    { label: RoleEnum.Manager.description, value: RoleEnum.Manager.value },
    { label: RoleEnum.Staff.description, value: RoleEnum.Staff.value },
  ];

  const isVolunteerFilterMode = pageState.filterMode === FilterRoleEnum.Volunteer.value;
  const isAdmin = user.role === RoleEnum.Admin.name;

  const volunteerGridOptions = {
    columns: [
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Họ tên',
        field: 'name',
        type: 'string',
        width: 180,
      },
      {
        headerName: 'Địa chỉ',
        type: 'string',
        field: 'address',
        flex: 1,
      },
      {
        headerName: 'CCCD/CMND',
        type: 'string',
        field: 'nationalIdAndCitizenId',
        width: 120,
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
        width: 90,
        align: 'center',
      },
      {
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <div>
              <Tooltip title="Xem chi tiết" placement="bottom">
                <Box>
                  <Icon
                    onClick={() => {
                      navigate(`/user/${params.row.userInformationId}`);
                    }}
                    sx={{ cursor: 'pointer', fontSize: 18 }}
                    icon={'solid-eye'}
                  />
                </Box>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    pageState: pageState,
  };

  const managerStaffGridOptions = {
    columns: [
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Tên đăng nhập',
        field: 'userName',
        type: 'string',
        flex: 1,
        minWidth: 200,
      },
      {
        headerName: 'Bệnh viện',
        field: 'hospitalName',
        type: 'string',
        flex: 1,
        minWidth: 250,
      },
      {
        headerName: 'Trạng thái',
        field: 'isActive',
        type: 'boolean',
        width: 130,
        renderCell: ({ value }) => {
          return <Tag status={StatusTagConvertLabel(value)}>{value ? 'Đang hoạt động' : 'Vô hiệu hóa'}</Tag>;
        },
      },
      {
        headerName: 'Ngày tạo',
        type: 'string',
        field: 'addDate',
        width: 150,
        align: 'left',
      },

      {
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <div>
              <Tooltip title="Vô hiệu" placement="bottom">
                <Box>
                  <Icon
                    onClick={() => {}}
                    sx={{ color: params.row.isActive ? 'error.main' : 'success.main', cursor: 'pointer', fontSize: 18 }}
                    icon={params.row.isActive ? 'solid-trash' : 'solid-trash-slash'}
                  />
                </Box>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    pageState,
  };

  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };

  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, page: 1, pageSize: newPageSize }));
  };

  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, filterMode: value, page: 1, pageSize: 10 }));
    setSearchParam('');
  };

  const handleUserSearch = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1 }));
    setSearchParam(searchValue.searchTerm);
  };
  const handleAddUserOption = () => {
    setIsAddAccountOptionsOpen(!isAddAccountOptionsOpen);
  };

  const handleImportAccountDialog = () => {
    if (!isImportAccountOpen) {
      setHospitalsGetParam({ FilterMode: HospitalFilterEnum.All, Status: true, Page: 1, PageSize: 10, SearchKey: '' });
    }
    setIsImportAccountOpen(!isImportAccountOpen);

    importUserReset();
  };

  const handleAddUserDialog = () => {
    //When dialog closes, reset the HospitalsGetParam
    if (!isAddUserOpen) {
      setHospitalsGetParam({ FilterMode: HospitalFilterEnum.All, Status: true, Page: 1, PageSize: 10, SearchKey: '' });
    }
    setIsAddUserOpen(!isAddUserOpen);

    addUserReset();
  };

  const handleScrollToBottom = async (newSize) => {
    setHospitalsGetParam((pre) => ({ ...pre, PageSize: newSize }));
  };

  const handleSearchHospitalOnAutocomplete = async (value) => {
    setHospitalsGetParam((pre) => ({ ...pre, SearchKey: value }));
  };

  const handleScrollToBottomToFilter = async (newSize) => {
    setHospitalsFilterParam((pre) => ({ ...pre, PageSize: newSize }));
  };

  const handleSearchHospitalToFilter = async (value) => {
    setHospitalsFilterParam((pre) => ({ ...pre, SearchKey: value }));
  };

  const handleChooseHospital = (value) => {
    setPageState((pre) => ({ ...pre, hospitalId: value?.id || '' }));
  };

  const handleDetailAlertDialog = () => {
    setIsDetailAlertOpen(!isDetailAlertOpen);
  };

  const handleFilterStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };
  const AddUserSchema = Yup.object().shape({
    username: Yup.string().required('Vui lòng nhập tên tài khoản').matches(EMAIL_PATTERN, {
      message: 'Tên tài khoản không hợp lệ',
      excludeEmptyString: false,
    }),
    hospital: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string(),
          name: Yup.string(),
        })
      )
      .transform(function (value, originalValue) {
        if (originalValue?.length < 1 || !originalValue) return [];
        return [
          {
            id: originalValue?.id,
            name: originalValue?.name,
          },
        ];
      })
      .min(1, 'Vui lòng chọn bệnh viện.'),
  });

  const ImportUserSchema = Yup.object().shape({
    hospital: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string(),
          name: Yup.string(),
        })
      )
      .transform(function (value, originalValue) {
        if (originalValue?.length < 1 || !originalValue) return [];
        return [
          {
            id: originalValue?.id,
            name: originalValue?.name,
          },
        ];
      })
      .min(1, 'Vui lòng chọn bệnh viện.'),
  });

  const {
    handleSubmit: handleAddUserSubmit,
    control: addUserControl,
    reset: addUserReset,
  } = useForm({
    resolver: yupResolver(AddUserSchema),
    mode: 'onChange',
    defaultValues: { username: '', hospital: [], role: roleSelectOption[0].value },
    reValidateMode: 'onChange',
  });

  const {
    handleSubmit: handleImportUserSubmit,
    control: importUserControl,
    reset: importUserReset,
  } = useForm({
    resolver: yupResolver(ImportUserSchema),
    mode: 'onChange',
    defaultValues: { hospital: [], role: roleSelectOption[0].value },
    reValidateMode: 'onChange',
  });

  const onAddUserSubmit = async (data) => {
    setIsButtonLoading(true);
    try {
      const response = await addUser({
        role: data.role * 1,
        hospitalId: data.hospital[0].id * 1,
        accounts: [
          {
            username: data.username,
          },
        ],
      });

      if (response.failedList.length <= 0) {
        enqueueSnackbar('Tạo tài khoản thành công', {
          variant: 'success',
          persist: false,
        });
      } else {
        enqueueSnackbar(convertErrorCodeToMessage(response.failedList[0].errorCode), {
          variant: 'error',
          persist: false,
        });
      }

      handleAddUserDialog();
      fetchUserListData();
      addUserReset();
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const addUserOptionDialogContent = () => {
    return (
      <Box>
        <Stack gap={3}>
          <Button
            startIcon={<Icon icon="solid-pen-line" />}
            variant="contained"
            onClick={() => {
              handleAddUserOption();
              handleAddUserDialog();
            }}
          >
            Tạo bằng cách nhập
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
              handleAddUserOption();
              handleImportAccountDialog();
            }}
          >
            Tạo tài khoản nhân viên y tế từ file
          </Button>
        </Stack>
      </Box>
    );
  };

  const addUserDialogContent = () => {
    return (
      <Box>
        <form onSubmit={handleAddUserSubmit(onAddUserSubmit)}>
          <RHFAsyncAutoComplete
            isLazyLoad={true}
            name="hospital"
            control={addUserControl}
            label="Bệnh viện"
            isRequiredLabel={true}
            list={hospitals}
            onInput={handleSearchHospitalOnAutocomplete}
            onScrollToBottom={handleScrollToBottom}
            paramsCompare="id"
            getOptionLabel={(option) => {
              return option?.name || '';
            }}
          />
          <RHFSelect name="role" label="Vai trò" control={addUserControl} isRequiredLabel={true}>
            {roleSelectOption.map((option, i) => (
              <MenuItem key={i} value={option?.value}>
                {option?.label}
              </MenuItem>
            ))}
          </RHFSelect>

          <RHFInput
            label="Tên tài khoản"
            name="username"
            control={addUserControl}
            placeholder="Nhập tên tài khoản"
            isRequiredLabel={true}
          />
          <Stack>
            <Box sx={{ marginLeft: 'auto', marginTop: '20px' }}>
              <LoadingButton variant="contained" type="submit" loading={isButtonLoading}>
                Tạo
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

  const onSubmitImport = async (data) => {
    setIsButtonLoading(true);

    try {
      setIsMultipleAlertOpen(false);
      const response = await addUser({
        role: RoleEnum.Staff.value,
        hospitalId: data.hospital[0].id * 1,
        accounts: importParams,
      });

      const mappingSuccessList = response?.successList.map((data) => ({
        data,
      }));

      const mappingDateFailList = response?.failedList.map((data) => ({
        errorCode: data?.errorCode,
        data: { data: data.data, index: data?.index },
      }));

      setAlertResult({ successList: mappingSuccessList, failedList: mappingDateFailList });
      setIsMultipleAlertOpen(true);
      handleImportAccountDialog();
      fetchUserListData();
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const importAccountDialogContent = () => {
    return (
      <form onSubmit={handleImportUserSubmit(onSubmitImport)}>
        <RHFAsyncAutoComplete
          isLazyLoad={true}
          name="hospital"
          control={importUserControl}
          label="Bệnh viện"
          isRequiredLabel={true}
          list={hospitals}
          onInput={handleSearchHospitalOnAutocomplete}
          onScrollToBottom={handleScrollToBottom}
          paramsCompare="id"
          getOptionLabel={(option) => {
            return option?.name || '';
          }}
        />

        <Stack spacing={3} sx={{ height: '100%' }}>
          <AccountImport label="Kéo thả hoặc nhấn vào để chọn file" onImport={getDataFromFile} />

          <DownloadLink ref={downloadRef} download />
          <Stack direction="row" justifyContent="space-between">
            <Button
              sx={{ width: '150px' }}
              startIcon={<Icon icon="solid-file-download" />}
              onClick={async () => {
                try {
                  await handleDownloadTemplate('template_import/account_template.csv', downloadRef);
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
                <Button onClick={handleImportAccountDialog}>Hủy</Button>
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

  const fetchUserListData = useCallback(async () => {
    setPageState((pre) => ({ ...pre, isLoading: true, data: [] }));
    try {
      const getVolunteerParam = {
        Role: pageState.filterMode,
        SearchKey: searchParam,
        Page: pageState.page,
        PageSize: pageState.pageSize,
      };

      const getManagerStaffParam = {
        Role: pageState.filterMode,
        HospitalId: pageState.hospitalId,
        SearchKey: searchParam,
        ...(statusFilter > 0 && { IsActive: statusFilter === 1 }),
        Page: pageState.page,
        PageSize: pageState.pageSize,
      };

      const data = await getUsers(isVolunteerFilterMode ? getVolunteerParam : getManagerStaffParam);

      const dataRow = isVolunteerFilterMode
        ? data.items?.map((data, i) => ({
            id: data?.userInformation?.userId,
            name: data?.userInformation?.fullName || '-',
            address: data?.userInformation?.address || '-',
            nationalIdAndCitizenId: data?.userInformation?.nationalId || data?.userInformation?.citizenId,
            phoneNumber: formatPhoneNumber(data?.phoneNumber) || '-',
            bloodType: data?.userInformation?.bloodTypeId
              ? convertBloodTypeLabel(data?.userInformation?.bloodTypeId, data?.userInformation?.isRhNegative)
              : '-',
            userInformationId: data?.userInformationId,
          }))
        : data.items?.map((data, i) => ({
            id: data?.id,
            userName: data?.userName || '-',
            hospitalName: data?.hospital?.name || '-',
            addDate: formatDate(data?.addDate, 4) || '-',
            isActive: data?.isActive,
          }));
      setPageState((pre) => ({ ...pre, data: dataRow, total: data.total }));
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setPageState((pre) => ({ ...pre, isLoading: false }));
    }
  }, [pageState.pageSize, pageState.page, searchParam, pageState.filterMode, pageState.hospitalId, statusFilter]);

  useEffect(() => {
    fetchUserListData();
  }, [fetchUserListData]);

  const fetchFilterHospitals = useCallback(async () => {
    const data = await getHospitalsList(hospitalFilterParam);

    const mappingData = data?.items.map((item) => ({ id: item.id, name: item.name }));
    setFilterHospitals(mappingData || []);
  }, [hospitalFilterParam.PageSize, hospitalFilterParam.SearchKey]);

  useEffect(() => {
    fetchFilterHospitals();
  }, [fetchFilterHospitals]);

  const fetchHospitals = useCallback(async () => {
    if (isAddUserOpen || isImportAccountOpen) {
      const data = await getHospitalsList(hospitalGetParam);

      const mappingData = data?.items.map((item) => ({ id: item.id, name: item.name }));

      setHospitals(mappingData || []);
    }
  }, [hospitalGetParam.PageSize, hospitalGetParam.SearchKey, isAddUserOpen, isImportAccountOpen]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading={isAdmin ? 'Danh sách tài khoản' : 'Danh sách tình nguyện viên'}
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: isAdmin ? 'Danh sách tài khoản' : 'Danh sách tình nguyện viên' },
          ]}
        />

        {isAdmin && (
          <Button startIcon={<Icon icon="solid-plus" />} variant="contained" onClick={handleAddUserOption}>
            Tạo tài khoản
          </Button>
        )}
      </HeaderMainStyle>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          {isAdmin && (
            <FilterTab
              tabs={getValuesFromEnum(FilterRoleEnum)}
              onChangeTab={handleFilterTabChange}
              defaultValue={pageState.filterMode}
            />
          )}

          <InputFilterSectionStyle>
            {pageState.filterMode !== FilterRoleEnum.Volunteer.value && (
              <>
                <Box>
                  <Select
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return 'Chọn trạng thái';
                      }

                      return userStatusOption.find((option) => option.value === selected).name;
                    }}
                    sx={{ minWidth: 200 }}
                    name={'status'}
                    select={'true'}
                    value={statusFilter}
                    onChange={handleFilterStatusChange}
                    displayEmpty
                  >
                    {userStatusOption?.map((option) => (
                      <MenuItem
                        sx={{ cursor: 'pointer', mb: 1, px: 3, py: 1.5 }}
                        key={option?.value}
                        value={option?.value}
                      >
                        {option?.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                <AsyncAutocompleteFilter
                  sx={{ width: '50%' }}
                  placeholder="Chọn bệnh viện"
                  onInput={handleSearchHospitalToFilter}
                  onSelect={handleChooseHospital}
                  list={filterHospitals || []}
                  isLazyLoad={true}
                  onScrollToBottom={handleScrollToBottomToFilter}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    );
                  }}
                  getOptionLabel={(option) => {
                    return option?.name || '';
                  }}
                />
              </>
            )}

            <SearchBar
              sx={{ width: isVolunteerFilterMode ? '100%' : '50%' }}
              type={isVolunteerFilterMode ? 'number' : 'text'}
              className="search-bar"
              placeholder={isVolunteerFilterMode ? 'Nhập số điện thoại' : 'Nhập tên tài khoản'}
              onSubmit={handleUserSearch}
            />
          </InputFilterSectionStyle>
        </Box>

        <DataTable
          gridOptions={isVolunteerFilterMode ? volunteerGridOptions : managerStaffGridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />

        {/* Add User Option Dialog */}
        <CustomDialog
          isOpen={isAddAccountOptionsOpen}
          onClose={handleAddUserOption}
          title={'Tạo tài khoản'}
          children={addUserOptionDialogContent()}
          sx={{ '& .MuiDialog-paper': { width: '70%' } }}
        />

        {/* Add User Dialog */}
        <CustomDialog
          isOpen={isAddUserOpen}
          onClose={handleAddUserDialog}
          title={`Tạo tài khoản`}
          children={addUserDialogContent()}
          sx={{ '& .MuiDialog-paper': { width: '70%' } }}
        />

        {/* Import User Dialog */}
        <CustomDialog
          isOpen={isImportAccountOpen}
          onClose={handleImportAccountDialog}
          title={'Tạo tài khoản nhân viên y tế từ file'}
          children={importAccountDialogContent()}
          sx={{ '& .MuiDialog-paper': { width: '70%' } }}
        />
      </Box>

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
        columns={[{ name: 'Tài khoản', field: 'data' }]}
        sx={{ '& .MuiDialog-paper': { width: '80% !important', maxHeight: '600px' } }}
      />
    </>
  );
};

export default UserListPage;
