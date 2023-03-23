import React, { useState, useEffect, useCallback } from 'react';
import { Box, Stack, Button, Tooltip } from '@mui/material';
import {
  DataTable,
  FilterTab,
  SearchBar,
  CustomDialog,
  RHFPasswordInput,
  HeaderBreadcumbs,
  RHFInput,
  RHFAsyncAutoComplete,
  RHFSelect,
  AsyncAutocompleteFilter,
  Icon,
  Tag,
} from 'components';
import { useNavigate } from 'react-router-dom';
import {
  errorHandler,
  convertBloodTypeLabel,
  formatDate,
  PASSWORD_PATTERN,
  USERNAME_PATTERN,
  InputFilterSectionStyle,
  HeaderMainStyle,
  formatPhoneNumber,
  FilterRoleEnum,
  getFilterTabValuesFromEnum,
  HospitalFilterEnum,
  RoleEnum,
} from 'utils';
import { getUsers, changePassword, getHospitalsList, addUser } from 'api';
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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
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
  const { enqueueSnackbar } = useSnackbar();

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
        renderCell: (params) => {
          return (
            <div>
              <Tooltip title="Đổi mật khẩu" placement="bottom">
                <Box>
                  <Icon
                    onClick={() => {
                      setChangePassWordUserName(params.row.userName);
                      setChangePassWordId(params.row.id);
                      handleChangePasswordDialog();
                    }}
                    sx={{ cursor: 'pointer', fontSize: 18 }}
                    icon={'solid-key'}
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

  const handleChangePasswordDialog = () => {
    setIsChangePasswordOpen(!isChangePasswordOpen);
    changePasswordReset();
  };

  const handleAddUserDialog = () => {
    //When dialog closes, reset the HospitalsGetParam
    if (!isAddUserOpen) {
      setHospitalsGetParam({ FilterMode: HospitalFilterEnum.All, Page: 1, PageSize: 10, SearchKey: '' });
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
    defaultValues: { username: '', hospital: [], password: '', confirmPassword: '', role: roleSelectOption[0].value },
    reValidateMode: 'onChange',
  });

  const onChangePasswordSubmit = async (data) => {
    setIsButtonLoading(true);

    try {
      data.changeMode = 1;
      data.userId = changePassWordId;
      await changePassword(data);
      enqueueSnackbar('Thay đổi mật khẩu thành công', {
        variant: 'success',
        persist: false,
      });
      changePasswordReset();
      handleChangePasswordDialog();
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const onAddUserSubmit = async (data) => {
    setIsButtonLoading(true);
    try {
      await addUser({
        username: data.username,
        password: data.password,
        role: data.role * 1,
        hospitalId: data.hospital[0].id * 1,
      });

      enqueueSnackbar('Tạo tài khoản thành công', {
        variant: 'success',
        persist: false,
      });
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
          heading={isAdmin ? 'Danh sách tài khoản' : 'Danh sách tình nguyện viên'}
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: isAdmin ? 'Danh sách tài khoản' : 'Danh sách tình nguyện viên' },
          ]}
        />

        {isAdmin && (
          <Button startIcon={<Icon icon="solid-plus" />} variant="contained" onClick={handleAddUserDialog}>
            Tạo tài khoản
          </Button>
        )}
      </HeaderMainStyle>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          {isAdmin && (
            <FilterTab
              tabs={getFilterTabValuesFromEnum(FilterRoleEnum)}
              onChangeTab={handleFilterTabChange}
              defaultValue={pageState.filterMode}
            />
          )}

          <InputFilterSectionStyle>
            {pageState.filterMode !== FilterRoleEnum.Volunteer.value && (
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
          sx={{ '& .MuiDialog-paper': { width: '70%' } }}
        />
      </Box>
    </>
  );
};

export default UserListPage;
