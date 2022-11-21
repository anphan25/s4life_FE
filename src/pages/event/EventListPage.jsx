import React, { useState, useEffect } from 'react';
import { Stack, styled, Button, Box } from '@mui/material';
import { HiPlus } from 'react-icons/hi';
import { DataTable, HeaderBreadcumbs, SearchBar, FilterTab } from 'components';
import { formatDate } from 'utils/formatDate';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { FcCancel } from 'react-icons/fc';
import { BiEditAlt } from 'react-icons/bi';
import { getEvent } from 'api/EventApi';
import { RHFDatePicker } from 'components';
import { useSelector } from 'react-redux';

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

const EventListPage = () => {
  let user = useSelector((state) => state.auth.auth?.user);
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    filterMode: 2, // 1: All, 2: FilterAndSearch, 3: EventRegisterable, 4: MostRecent
    status: 1, // 1: unstarted, 2: started, 3: finished, 4: canceled
    eventType: 1, // 1: sk cố định, 2: sk theo lịch bv, 3: sk lưu động
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
        headerName: 'Mã sự kiện',
        field: 'eventCode',
        type: 'string',
        minWidth: 150,
        flex: 1,
      },
      {
        headerName: 'Địa điểm',
        type: 'string',
        field: 'address',
        minWidth: 200,
        flex: 1,
      },

      {
        headerName: 'Thời gian',
        type: 'string',
        field: 'time',
        minWidth: 200,
        flex: 1,
        // renderCell: (cellValue) => {
        //   return <Box>{formatDate(cellValue.startDate, 1) - formatDate(cellValue.endDate, 1)}</Box>;
        // },
      },

      {
        headerName: 'Số người đăng kí',
        field: 'numberOfRegistration',
        type: 'number',
        width: 150,
      },
      {
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,
        getActions: (params) => [
          <GridActionsCellItem
            disabled={pageState.filterTabMode === 2}
            icon={<BiEditAlt />}
            onClick={() => {}}
            label="Chỉnh sửa sự kiện"
            showInMenu
          />,
          <GridActionsCellItem
            disabled={pageState.filterTabMode === 1}
            icon={<FcCancel />}
            onClick={() => {}}
            label="Hủy sự kiện"
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
    setPageState((old) => ({ ...old, pageSize: newPageSize }));
  };

  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, Status: value, page: 1 }));
  };

  const handleSearchEventName = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  const fetchData = async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));

    const data = await getEvent({
      FilterMode: 2,
      EventType: pageState.eventType,
      Status: pageState.status,
      Page: pageState.page,
      PageSize: pageState.pageSize,
      SearchKey: pageState.searchKey,
    });

    const dataRow = data.items.map((data, i) => ({
      no: i + 1,
      id: data.id,
      name: data.name || '-',
      eventCode: data.eventCode || '-',
      address: data.eventLocations[0].location.name || '-',
      time: `${formatDate(data.startDate, 1)} - ${formatDate(data.endDate, 1)}`,
      numberOfRegistration: data.numberOfRegistration || 0,
    }));
    setPageState({ ...pageState, isLoading: false, data: dataRow, total: data.total });
  };

  useEffect(() => {
    setPageState({ ...pageState, isLoading: true });
    fetchData();
  }, [pageState.pageSize, pageState.page, pageState.searchKey, pageState.status]);

  return (
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách sự kiện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách sự kiện' }]}
        />
        {user.role === 'Manager' && (
          <Button startIcon={<HiPlus />} variant="contained" onClick={() => {}}>
            Thêm sự kiện
          </Button>
        )}
      </HeaderMainStyle>

      <FilterSectionStyle>
        <FilterTab tabs={filterTabValues} onChangeTab={handleFilterTabChange} defaultValue={pageState.status} />
        <Stack direction="row">
          <SearchBar className="search-bar" placeholder="Nhập tên sự kiện" onSubmit={handleSearchEventName} />
        </Stack>
      </FilterSectionStyle>

      <DataTable
        gridOptions={gridOptions}
        onPageChange={pageChangeHandler}
        onPageSizeChange={pageSizeChangeHandler}
        disableFilter={true}
      />
    </div>
  );
};

export default EventListPage;
