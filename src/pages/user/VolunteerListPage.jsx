import { useState } from 'react';
import { Button, Stack, DialogActions, styled, Box, Typography } from '@mui/material';
import { CustomDialog, DataTable, HeaderBreadcumbs, CustomSnackBar, SearchBar } from 'components';

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

const VolunteerListPage = () => {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });

  const gridOptions = {
    columns: [
      {
        headerName: 'No',
        field: 'no',
        width: 10,
      },
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Tên',
        field: 'name',
        type: 'string',
        minWidth: 150,
        flex: 1,
      },
      {
        headerName: 'Địa chỉ',
        field: 'address',
        minWidth: 200,
        flex: 2,
      },
      {
        headerName: 'Số điện thoại',
        field: 'phoneNumber',
        type: 'string',
        width: 110,
      },
      {
        headerName: 'Nhóm máu',
        field: 'bloodType',
        type: 'string',
        width: 100,
      },
      {
        headerName: 'Số lần hiến',
        field: 'numberOfDonation',
        type: 'number',
        width: 100,
      },
      {
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,
        getActions: (params) => [],
      },
    ],
    pageState: pageState,
  };
  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };

  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, pageSize: newPageSize }));
  };

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách tình nguyện viên"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách tình nguyện viên' }]}
        />
      </HeaderMainStyle>
      <DataTable
        gridOptions={gridOptions}
        onPageChange={pageChangeHandler}
        onPageSizeChange={pageSizeChangeHandler}
        disableFilter={true}
      />
    </>
  );
};

export default VolunteerListPage;
