import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, styled, Stack } from '@mui/material';
import { DataTable, FilterTab, SearchBar, CustomSnackBar } from 'components';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { FcKey } from 'react-icons/fc';
import { errorHandler, convertBloodTypeLabel, formatDate } from 'utils';

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
  { label: 'Quản lý bệnh viện', value: 2 },
  { label: 'Nhân viên bệnh viện', value: 3 },
  { label: 'Quản trị viên', value: 4 },
];

const UserListPage = () => {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    filterMode: 1, //1: Volunteer, 2: Manager, 3: Staff, 4: Admin
    searchKey: '',
  });

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

  const volunteerDummyData = {
    items: [
      {
        id: 1,
        name: 'Trần Hải nam',
        address: '60 Hùng Vương Tân An, Long An',
        phoneNumber: '09031841124',
        nationalId: '21124122112',
        dateOfBirth: new Date(),
        bloodTypeId: 1,
        isRhNegative: true,
      },
    ],
  };

  const notVolunteerGridOptions = {
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
        field: 'username',
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

  const notVolunteerDummyData = { items: [{ id: 1, username: 'manager1', hospitalName: 'Bệnh Viện Chợ Rẫy' }] };

  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };

  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, pageSize: newPageSize }));
  };

  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, filterMode: value, page: 1 }));
  };

  const handleSearchEventName = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  const fetchUserListData = useCallback(async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));
    setAlert({});

    try {
      //Call get user api
      // const data = await getUsers({
      //   FilterMode: pageState.filterMode,
      //   EventType: pageState.eventType,
      //   Status: pageState.status,
      //   Page: pageState.page,
      //   PageSize: pageState.pageSize,
      //   SearchKey: pageState.searchKey,
      // });

      const dataRow =
        pageState.filterMode === 1
          ? volunteerDummyData.items?.map((data, i) => ({
              no: i + 1,
              id: data?.id,
              name: data?.name || '-',
              address: data?.address || '-',
              nationalId: data?.nationalId || '-',
              phoneNumber: data?.phoneNumber || '-',
              bloodType: data?.bloodTypeId ? convertBloodTypeLabel(data?.bloodTypeId, data?.isRhNegative) : '-',
              dateOfBirth: formatDate(data?.dateOfBirth, 2) || '-',
            }))
          : notVolunteerDummyData.items?.map((data, i) => ({
              no: i + 1,
              id: data?.id,
              username: data?.username || '-',
              hospitalName: data?.hospitalName || '-',
            }));
      setPageState({ ...pageState, data: dataRow, total: 1 });
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setPageState((old) => ({ ...old, isLoading: false }));
    }
  }, [pageState.pageSize, pageState.page, pageState.searchKey, pageState.filterMode]);

  useEffect(() => {
    fetchUserListData();
  }, [fetchUserListData]);

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
          <SearchBar
            sx={{ width: '100%' }}
            className="search-bar"
            placeholder={pageState.filterMode === 1 ? 'Nhập CMND/CCCD' : 'Nhập tên tài khoản'}
            onSubmit={handleSearchEventName}
          />
        </InputFilterSectionStyle>
      </FilterSectionStyle>

      <DataTable
        density="comfortable"
        gridOptions={pageState.filterMode === 1 ? volunteerGridOptions : notVolunteerGridOptions}
        onPageChange={pageChangeHandler}
        onPageSizeChange={pageSizeChangeHandler}
        disableFilter={true}
      />

      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </Paper>
  );
};

export default UserListPage;
