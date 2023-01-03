import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, styled, Stack, MenuItem, Button } from '@mui/material';
import { HiPlus } from 'react-icons/hi';
import {
  DataTable,
  FilterTab,
  SearchBar,
  CustomSnackBar,
  CustomDialog,
  RHFPasswordInput,
  HeaderBreadcumbs,
  RHFInput,
  RHFAutoComplete,
  RHFSelect,
} from 'components';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { FcKey } from 'react-icons/fc';
import { errorHandler, convertBloodTypeLabel, formatDate, PASSWORD_PATTERN } from 'utils';
import { getUsers, changePassword } from 'api';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

const InputFilterSectionStyle = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  margin: '20px',
  gap: 10,

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const HeaderMainStyle = styled(Stack)(({ theme }) => ({
  marginBottom: '20px',
  justifyContent: 'space-between',

  flexDirection: 'row',

  [theme.breakpoints.up('sm')]: {
    alignItems: 'center',
  },

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    justifyContent: 'start',
    gap: '20px',
  },
}));

const filterTabValues = [
  { label: 'Tình nguyện viên', value: 1 },
  { label: 'Quản lý bệnh viện', value: 3 },
  { label: 'Nhân viên bệnh viện', value: 2 },
];

const UserListPage = () => {
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
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [hospitalData, setHospitalData] = useState([]);
  const [changePassWordUserName, setChangePassWordUserName] = useState();
  const [changePassWordId, setChangePassWordId] = useState();
  const [isButtonLoading, setIsButtonLoading] = useState(false);

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
        headerName: 'No',
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
        field: 'name',
        type: 'string',
        width: 150,
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
        type: 'string',
        field: 'nationalId',
        width: 200,
      },

      {
        headerName: 'Ngày sinh',
        type: 'string',
        field: 'dateOfBirth',
        width: 100,
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
    ],
    pageState: pageState,
  };

  const managerStaffGridOptions = {
    columns: [
      {
        headerName: 'No',
        field: 'no',
        width: 10,
        align: 'center',
      },
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
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<FcKey />}
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
    setPageState((old) => ({ ...old, pageSize: newPageSize }));
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
  };

  const handleAddUserDialog = () => {
    setIsAddUserOpen(!isAddUserOpen);
  };

  const ChangePasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('Vui lòng nhập mật khẩu hiện tại.')
      .matches(PASSWORD_PATTERN, {
        message:
          'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
        excludeEmptyString: false,
      })
      .oneOf([Yup.ref('newPassword')], 'Xác nhận mật khẩu không trùng khớp.'),
    confirmPassword: Yup.string()
      .required('Vui lòng nhập mật khẩu hiện tại')
      .matches(PASSWORD_PATTERN, {
        message:
          'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
        excludeEmptyString: false,
      })
      .oneOf([Yup.ref('newPassword')], 'Xác nhận mật khẩu không trùng khớp.'),
  });

  const { handleSubmit: handleChangePasswordSubmit, control: changePasswordControl } = useForm({
    resolver: yupResolver(ChangePasswordSchema),
    mode: 'onChange',
  });

  const { handleSubmit: handleAddUserSubmit, control: addUserControl } = useForm({
    // resolver: yupResolver(ChangePasswordSchema),
    mode: 'onChange',
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
      data.currentPassword = '';
      data.changePassword = '';
      data.confirmPassword = '';
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      handleChangePasswordDialog();
      setIsButtonLoading(false);
    }
  };

  const onAddUserSubmit = async () => {};

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

  const addUserDialogContent = () => {
    return (
      <Box>
        <form onSubmit={handleAddUserSubmit(onAddUserSubmit)}>
          <Stack direction="row" spacing={2}>
            {/* <RHFAutoComplete
              control={addUserControl}
              label="Bệnh viện"
              isRequiredLabel={true}
              list={[]}
              onScrollToBottom={() => {}}
            />
            <RHFSelect name="role" label="Chọn vai trò" control={addUserControl} isRequiredLabel={true}>
              {roleList.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect> */}
          </Stack>
          <RHFInput
            label="tên tài khoản"
            name="username"
            control={addUserControl}
            placeholder="Nhập mật khẩu"
            isRequiredLabel={true}
          />
          <RHFInput
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
                Cập nhật
              </LoadingButton>
            </Box>
          </Stack>
        </form>
      </Box>
    );
  };

  const fetchUserListData = useCallback(async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));
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
              no: i + 1,
              id: data?.userInformation?.userId,
              name: data?.userInformation?.fullName || '-',
              address: data?.userInformation?.address || '-',
              nationalId: data?.userInformation?.nationalId || '-',
              phoneNumber: data?.userName || '-',
              bloodType: data?.userInformation?.bloodTypeId
                ? convertBloodTypeLabel(data?.userInformation?.bloodTypeId, data?.userInformation?.isRhNegative)
                : '-',
              dateOfBirth: formatDate(data?.userInformation?.dateOfBirth, 2) || '-',
            }))
          : data.items?.map((data, i) => ({
              no: i + 1,
              id: data?.id,
              userName: data?.userName || '-',
              hospitalName: data?.hospital?.name || '-',
            }));
      setPageState({ ...pageState, data: dataRow, total: data.total });
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setPageState((old) => ({ ...old, isLoading: false }));
    }
  }, [pageState.pageSize, pageState.page, searchParam, pageState.filterMode, pageState.hospitalId]);

  useEffect(() => {
    fetchUserListData();
  }, [fetchUserListData]);

  // const fetchHospitals = async () => {
  //   const data = await getHospitalsList({});
  //   setHospitalData(data?.items);
  // };

  // useEffect(() => {
  //   fetchHospitals();
  // }, []);

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách người dùng"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách người dùng' }]}
        />

        <Button startIcon={<HiPlus />} variant="contained" onClick={handleAddUserDialog}>
          Thêm người dùng
        </Button>
      </HeaderMainStyle>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <FilterTab tabs={filterTabValues} onChangeTab={handleFilterTabChange} defaultValue={pageState.filterMode} />

          <InputFilterSectionStyle>
            {/* {pageState.filterMode !== 1 && <LazyLoadAutocomplete placeholder="Chọn bệnh viện" loadMore={() => {}} />} */}
            <SearchBar
              sx={{ width: '100%' }}
              type={pageState.filterMode === 1 ? 'number' : 'text'}
              className="search-bar"
              placeholder={pageState.filterMode === 1 ? 'Nhập số điện thoại' : 'Nhập tên tài khoản'}
              onSubmit={handleUserSearch}
            />
          </InputFilterSectionStyle>
        </Box>

        <DataTable
          density="comfortable"
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

        {/* Add User Dialog */}
        <CustomDialog
          isOpen={isAddUserOpen}
          onClose={handleAddUserDialog}
          title={`Tạo tài khoản`}
          children={addUserDialogContent()}
          sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
        />

        {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
      </Box>
    </>
  );
};

export default UserListPage;
