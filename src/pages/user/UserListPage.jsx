import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, styled, Stack } from '@mui/material';
import { DataTable, FilterTab, SearchBar, CustomSnackBar, LazyLoadAutocompleteFilter } from 'components';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { FcKey } from 'react-icons/fc';
import { errorHandler, convertBloodTypeLabel, formatDate } from 'utils';
import { getUsers, getHospitalsList } from 'api';

const FilterSectionStyle = styled(Box)(({ theme }) => ({
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

const InputFilterSectionStyle = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  margin: '20px',
  gap: 10,

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
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
    searchKey: '',
    hospitalId: '',
  });

  const [hospitalData, setHospitalData] = useState([]);

  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

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

      // {
      //   field: 'actions',
      //   type: 'actions',
      //   width: 50,
      //   sortable: false,
      //   filterable: false,
      //   getActions: (params) => [
      //     <GridActionsCellItem icon={<FcKey />} onClick={() => {}} label="Đổi mật khẩu" showInMenu />,
      //   ],
      // },
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
          <GridActionsCellItem icon={<FcKey />} onClick={() => {}} label="Đổi mật khẩu" showInMenu />,
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
    setPageState((old) => ({ ...old, filterMode: value, page: 1, pageSize: 10, searchKey: '' }));
  };

  const handleUserSearch = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  const fetchUserListData = useCallback(async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));
    setAlert({});

    try {
      const getVolunteerParam = {
        Role: pageState.filterMode,
        SearchKey: pageState.searchKey,
        Page: pageState.page,
        PageSize: pageState.pageSize,
      };

      const getManagerStaffParam = {
        Role: pageState.filterMode,
        HospitalId: pageState.hospitalId,
        SearchKey: pageState.searchKey,
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
  }, [pageState.pageSize, pageState.page, pageState.searchKey, pageState.filterMode, pageState.hospitalId]);

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
    <Paper elevation={1} sx={{ borderRadius: '20px' }}>
      <FilterSectionStyle>
        <FilterTab
          sx={{
            padding: '10px 20px 0',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            backgroundColor: '#F4F6F8',
          }}
          tabs={filterTabValues}
          onChangeTab={handleFilterTabChange}
          defaultValue={pageState.filterMode}
        />

        <InputFilterSectionStyle>
          {/* {pageState.filterMode !== 1 && <LazyLoadAutocomplete placeholder="Chọn bệnh viện" loadMore={() => {}} />} */}
          <SearchBar
            sx={{ width: '100%' }}
            className="search-bar"
            placeholder={pageState.filterMode === 1 ? 'Nhập số điện thoại' : 'Nhập tên tài khoản'}
            onSubmit={handleUserSearch}
          />
        </InputFilterSectionStyle>
      </FilterSectionStyle>

      <DataTable
        density="comfortable"
        gridOptions={pageState.filterMode === 1 ? volunteerGridOptions : managerStaffGridOptions}
        onPageChange={pageChangeHandler}
        onPageSizeChange={pageSizeChangeHandler}
        disableFilter={true}
      />

      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </Paper>
  );
};

export default UserListPage;
