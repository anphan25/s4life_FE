import React, { useState, useEffect, useCallback } from 'react';
import { Box, Stack, Button, MenuItem } from '@mui/material';
import {
  DataTable,
  FilterTab,
  SearchBar,
  CustomSnackBar,
  CustomDialog,
  RHFPasswordInput,
  HeaderBreadcumbs,
  RHFInput,
  RHFAsyncAutoComplete,
  RHFSelect,
  AsyncAutocompleteFilter,
  Icon,
  MoreMenuButton,
  Tag,
  styled,
} from 'components';
import { useNavigate } from 'react-router-dom';
import { GridActionsCellItem } from '@mui/x-data-grid';
import {
  errorHandler,
  convertBloodTypeLabel,
  formatDate,
  PASSWORD_PATTERN,
  USERNAME_PATTERN,
  InputFilterSectionStyle,
  HeaderMainStyle,
} from 'utils';
import { getUsers, changePassword, getHospitalsList, addUser } from 'api';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

const filterTabValues = [
  { label: 'Tình nguyện viên', value: 1 },
  { label: 'Quản lý viên', value: 3 },
  { label: 'Nhân viên', value: 2 },
];

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
    filterMode: 1, //1: Volunteer, 2: Staff, 3: Manager
    hospitalId: '',
  });

  const [searchParam, setSearchParam] = useState('');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangePhoneOpen, setIsChangePhoneOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [filterHospitals, setFilterHospitals] = useState([]);
  const [changePassWordUserName, setChangePassWordUserName] = useState();
  const [changePassWordId, setChangePassWordId] = useState();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [hospitalGetParam, setHospitalsGetParam] = useState({ FilterMode: 2, Page: 1, PageSize: 10, SearchKey: '' });
  const [hospitalFilterParam, setHospitalsFilterParam] = useState({
    FilterMode: 2,
    Page: 1,
    PageSize: 10,
    SearchKey: '',
  });

  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

  const roleList = [
    { label: 'Nhân viên', value: 2 },
    { label: 'Quản lý viên', value: 3 },
  ];

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
        minWidth: 200,
        flex: 1,
      },
      {
        headerName: 'CMND/CCCD',
        type: 'number',
        field: 'nationalId',
        width: 120,
      },
      {
        headerName: 'Giới tính',
        type: 'string',
        field: 'gender',
        minWidth: 30,
        align: 'center',
      },
      {
        headerName: 'Ngày sinh',
        type: 'date',
        field: 'dateOfBirth',
        width: 130,
        align: 'center',
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

        getActions: (params) => [
          <MoreMenuButton>
            <MenuItem
              onClick={() => {
                navigate(`/user/${params.row.userInformationId}`);
              }}
            >
              <Icon icon={'eye'} />
              Xem chi tiết
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleChangePhoneNumberDialog();
              }}
            >
              <Icon icon={'pen'} />
              Cập nhật
            </MenuItem>
          </MoreMenuButton>,
        ],
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
        renderCell: (value) => {
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
        getActions: (params) => [
          <GridActionsCellItem
            icon={<Icon icon="key" sx={{ fontSize: 18 }} />}
            onClick={() => {
              setChangePassWordUserName(params.row.userName);
              setChangePassWordId(params.row.id);
              handleChangePasswordDialog();
            }}
            label="Đổi mật khẩu"
            showInMenu
          />,
        ],
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

  const handleChangePasswordDialog = () => {
    setIsChangePasswordOpen(!isChangePasswordOpen);
    changePasswordReset();
  };
  const handleChangePhoneNumberDialog = () => {
    setIsChangePhoneOpen(!isChangePhoneOpen);
  };

  const handleAddUserDialog = () => {
    //When dialog closes, reset the HospitalsGetParam
    if (!isAddUserOpen) {
      setHospitalsGetParam({ FilterMode: 2, Page: 1, PageSize: 10, SearchKey: '' });
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

  const ChangePasswordSchema = Yup.object().shape({
    newPassword: Yup.string().required('Vui lòng nhập mật khẩu mới.').matches(PASSWORD_PATTERN, {
      message:
        'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
      excludeEmptyString: false,
    }),
    confirmPassword: Yup.string()
      .required('Vui lòng nhập lại mật khẩu.')
      .matches(PASSWORD_PATTERN, {
        message:
          'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
        excludeEmptyString: false,
      })
      .oneOf([Yup.ref('newPassword')], 'Xác nhận mật khẩu không trùng khớp.'),
  });

  const AddUserSchema = Yup.object().shape({
    username: Yup.string().required('Vui lòng nhập tên tài khoản').matches(USERNAME_PATTERN, {
      message: 'Tên tài khoản không hợp lệ',
      excludeEmptyString: false,
    }),
    hospital: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string().required('Vui lòng chọn bệnh viện'),
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
    password: Yup.string().required('Vui lòng nhập mật khẩu.').matches(PASSWORD_PATTERN, {
      message:
        'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
      excludeEmptyString: false,
    }),
    confirmPassword: Yup.string()
      .required('Vui lòng nhập lại mật khẩu.')
      .matches(PASSWORD_PATTERN, {
        message:
          'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
        excludeEmptyString: false,
      })
      .oneOf([Yup.ref('password')], 'Xác nhận mật khẩu không trùng khớp.'),
  });

  const {
    handleSubmit: handleChangePasswordSubmit,
    control: changePasswordControl,
    reset: changePasswordReset,
  } = useForm({
    resolver: yupResolver(ChangePasswordSchema),
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
    reValidateMode: 'onChange',
  });

  const {
    handleSubmit: handleAddUserSubmit,
    control: addUserControl,
    reset: addUserReset,
  } = useForm({
    resolver: yupResolver(AddUserSchema),
    mode: 'onChange',
    defaultValues: { username: '', hospital: [], password: '', confirmPassword: '', role: roleList[0].value },
    reValidateMode: 'onChange',
  });

  const onChangePasswordSubmit = async (data) => {
    setAlert({});
    setIsButtonLoading(true);

    try {
      data.changeMode = 1;
      data.userId = changePassWordId;
      await changePassword(data);
      setAlert({
        message: 'Thay đổi mật khẩu thành công.',
        status: true,
        type: 'success',
      });
      changePasswordReset();
      handleChangePasswordDialog();
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const onAddUserSubmit = async (data) => {
    setIsButtonLoading(true);
    setAlert({});
    try {
      await addUser({
        username: data.username,
        password: data.password,
        role: data.role * 1,
        hospitalId: data.hospital[0].id * 1,
      });

      setAlert({
        message: `Tạo tài khoản thành công`,
        status: true,
        type: 'success',
      });
      handleAddUserDialog();
      fetchUserListData();
      addUserReset();
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const changePasswordDialogContent = () => {
    return (
      <Box>
        <form onSubmit={handleChangePasswordSubmit(onChangePasswordSubmit)}>
          <RHFPasswordInput
            label="Mật khẩu mới"
            name="newPassword"
            control={changePasswordControl}
            placeholder="Nhập mật khẩu mới"
            isRequiredLabel={true}
          />
          <RHFPasswordInput
            label="Nhập lại mật khẩu"
            name="confirmPassword"
            control={changePasswordControl}
            placeholder="Nhập lại mật khẩu"
            isRequiredLabel={true}
          />
          <Stack>
            <Box sx={{ marginLeft: 'auto', marginTop: '20px' }}>
              <LoadingButton variant="contained" type="submit" loading={isButtonLoading}>
                Cập nhật
              </LoadingButton>
            </Box>
          </Stack>
        </form>
      </Box>
    );
  };

  const changePhoneNumberDialogContent = () => {
    return (
      <Box>
        <form>
          <RHFInput
            label="Số điện thoại mới"
            name="newPhone"
            control={changePasswordControl}
            placeholder="Nhập số điện thoại mới"
            isRequiredLabel={true}
          />

          <Stack>
            <Box sx={{ marginLeft: 'auto', marginTop: '20px' }}>
              <LoadingButton variant="contained" type="submit" loading={isButtonLoading}>
                Cập nhật
              </LoadingButton>
            </Box>
          </Stack>
        </form>
      </Box>
    );
  };

  const addUserDialogContent = () => {
    return (
      <Box>
        <form onSubmit={handleAddUserSubmit(onAddUserSubmit)}>
          <Stack direction="row" spacing={2}>
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
              {roleList.map((option, i) => (
                <option key={i} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </RHFSelect>
          </Stack>
          <RHFInput
            label="Tên tài khoản"
            name="username"
            control={addUserControl}
            placeholder="Nhập mật khẩu"
            isRequiredLabel={true}
          />
          <RHFPasswordInput
            label="Mật khẩu"
            name="password"
            control={addUserControl}
            placeholder="Nhập mật khẩu"
            isRequiredLabel={true}
          />
          <RHFPasswordInput
            label="Nhập lại mật khẩu"
            name="confirmPassword"
            control={addUserControl}
            placeholder="Nhập lại mật khẩu"
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

  const fetchUserListData = useCallback(async () => {
    setPageState((pre) => ({ ...pre, isLoading: true, data: [] }));
    setAlert({});
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
        Page: pageState.page,
        PageSize: pageState.pageSize,
      };

      const data = await getUsers(pageState.filterMode === 1 ? getVolunteerParam : getManagerStaffParam);

      const dataRow =
        pageState.filterMode === 1
          ? data.items?.map((data, i) => ({
              id: data?.userInformation?.userId,
              name: data?.userInformation?.fullName || '-',
              address: data?.userInformation?.address || '-',
              nationalId: data?.userInformation?.nationalId || '-',
              phoneNumber: data?.phoneNumber || '-',
              bloodType: data?.userInformation?.bloodTypeId
                ? convertBloodTypeLabel(data?.userInformation?.bloodTypeId, data?.userInformation?.isRhNegative)
                : '-',
              dateOfBirth: formatDate(data?.userInformation?.dateOfBirth, 4) || '-',
              gender: data?.userInformation?.gender || '-',
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
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setPageState((pre) => ({ ...pre, isLoading: false }));
    }
  }, [pageState.pageSize, pageState.page, searchParam, pageState.filterMode, pageState.hospitalId]);

  useEffect(() => {
    fetchUserListData();
  }, [fetchUserListData]);

  const fetchFilterHospitals = useCallback(async () => {
    const data = await getHospitalsList(hospitalFilterParam);

    const mappingData = data?.items.map((item) => ({ id: item.id, name: item.name }));
    setFilterHospitals(mappingData);
  }, [hospitalFilterParam.PageSize, hospitalFilterParam.SearchKey]);

  useEffect(() => {
    fetchFilterHospitals();
  }, [fetchFilterHospitals]);

  const fetchHospitals = useCallback(async () => {
    if (!isAddUserOpen) return;
    const data = await getHospitalsList(hospitalGetParam);

    const mappingData = data?.items.map((item) => ({ id: item.id, name: item.name }));

    setHospitals(mappingData);
  }, [hospitalGetParam.PageSize, hospitalGetParam.SearchKey, isAddUserOpen]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);
  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách tài khoản"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách tài khoản' }]}
        />

        <Button startIcon={<Icon icon="solid-plus" />} variant="contained" onClick={handleAddUserDialog}>
          Tạo tài khoản
        </Button>
      </HeaderMainStyle>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <FilterTab tabs={filterTabValues} onChangeTab={handleFilterTabChange} defaultValue={pageState.filterMode} />

          <InputFilterSectionStyle>
            {pageState.filterMode !== 1 && (
              <AsyncAutocompleteFilter
                sx={{ width: '50%' }}
                placeholder="Nhập tên bệnh viện"
                onInput={handleSearchHospitalToFilter}
                onSelect={handleChooseHospital}
                list={filterHospitals}
                isLazyLoad={true}
                onScrollToBottom={handleScrollToBottomToFilter}
                getOptionLabel={(option) => {
                  return option?.name || '';
                }}
              />
            )}

            <SearchBar
              sx={{ width: pageState.filterMode === 1 ? '100%' : '50%' }}
              type={pageState.filterMode === 1 ? 'number' : 'text'}
              className="search-bar"
              placeholder={pageState.filterMode === 1 ? 'Nhập số điện thoại' : 'Nhập tên tài khoản'}
              onSubmit={handleUserSearch}
            />
          </InputFilterSectionStyle>
        </Box>

        <DataTable
          gridOptions={pageState.filterMode === 1 ? volunteerGridOptions : managerStaffGridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />

        {/* Change Password Dialog */}
        <CustomDialog
          isOpen={isChangePasswordOpen}
          onClose={handleChangePasswordDialog}
          title={`Đổi mật khẩu cho tài khoản ${changePassWordUserName}`}
          children={changePasswordDialogContent()}
          sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
        />

        {/* Change PhoneNumber Dialog*/}
        <CustomDialog
          isOpen={isChangePhoneOpen}
          onClose={handleChangePhoneNumberDialog}
          title={`Đổi số điện thoại cho tài khoản `}
          children={changePhoneNumberDialogContent()}
          sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
        />

        {/* Add User Dialog */}
        <CustomDialog
          isOpen={isAddUserOpen}
          onClose={handleAddUserDialog}
          title={`Tạo tài khoản`}
          children={addUserDialogContent()}
          sx={{ '& .MuiDialog-paper': { width: '70%' } }}
        />

        {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
      </Box>
    </>
  );
};

export default UserListPage;
