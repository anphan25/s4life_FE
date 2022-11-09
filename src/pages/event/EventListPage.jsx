import React, { useState } from 'react';
import { Stack, styled, Button } from '@mui/material';
import { HiPlus } from 'react-icons/hi';
import { DataTable, HeaderBreadcumbs, SearchBar, FilterTab } from 'components';

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

const FilterSectionStyle = styled(Stack)(({ theme }) => ({
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

    '& .search-bar': { width: '100%' },
  },
}));

const filterTabValues = [
  { label: 'Chưa diễn ra', value: 1 },
  { label: 'Đang diễn ra', value: 2 },
  { label: 'Đã kết thúc', value: 3 },
  { label: 'Đã hủy', value: 4 },
];

const dummyData = [{}];

const EventListPage = () => {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    FilterTabMode: 1,
    searchKey: '',
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
        headerName: 'Sự kiện',
        field: 'name',
        type: 'string',
        minWidth: 150,
        flex: 1,
      },
      {
        headerName: 'Địa điểm',
        field: 'address',
        minWidth: 200,
        flex: 2,
      },

      {
        headerName: 'Thời gian',
        field: 'time',
        minWidth: 200,
        flex: 1,
      },

      {
        headerName: 'Số người đăng kí',
        field: 'numberOfRegisters',
        type: 'number',
        width: 130,
      },
      {
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,
      },
    ],
    pageState: pageState,
  };

  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, FilterTabMode: value, page: 1 }));
  };

  const handleSearchEventName = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  return (
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách sự kiện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách sự kiện' }]}
        />
        <Button startIcon={<HiPlus />} variant="contained" onClick={() => {}}>
          Thêm sự kiện
        </Button>
      </HeaderMainStyle>

      <FilterSectionStyle>
        <FilterTab tabs={filterTabValues} onChangeTab={handleFilterTabChange} defaultValue={pageState.FilterTabMode} />
        <SearchBar className="search-bar" placeholder="Nhập tên sự kiện" onSubmit={handleSearchEventName} />
      </FilterSectionStyle>

      <DataTable
        gridOptions={gridOptions}
        // onPageChange={pageChangeHandler}
        // onPageSizeChange={pageSizeChangeHandler}
        disableFilter={true}
      />
    </div>
  );
};

export default EventListPage;
