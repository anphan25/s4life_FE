import React, { useState, useEffect } from 'react';
import { Stack, styled, Button, Box, Paper } from '@mui/material';
import { HiPlus } from 'react-icons/hi';
import { DataTable, HeaderBreadcumbs, SearchBar, FilterTab, CustomDialog, FromToDateFilter } from 'components';
import { formatDate } from 'utils/formatDate';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { FcCancel, FcInfo } from 'react-icons/fc';
import { BiEditAlt } from 'react-icons/bi';
import { getEvent } from 'api/EventApi';
import { RHFDatePicker } from 'components';
import { useSelector } from 'react-redux';

import moment from 'moment';

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

const FilterSectionStyle = styled(Box)(({ theme }) => ({
  // margin: '20px',
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
  { label: 'Chưa diễn ra', value: 1 },
  { label: 'Đang diễn ra', value: 2 },
  { label: 'Đã kết thúc', value: 3 },
  { label: 'Đã hủy', value: 4 },
];

const isEventEditableOrCancelable = (status, numberOfRegistration) => {
  if (status === 'Đã kết thúc' || status === 'Đã hủy') {
    return false;
  }

  if (numberOfRegistration > 0) {
    return false;
  }

  return true;
};

const EventListPage = () => {
  let user = useSelector((state) => state.auth.auth?.user);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isDetailEventDialogOpen, setIsDetailEventDialogOpen] = useState(false);

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
    dateFrom: null,
    dateTo: null,
  });

  const gridOptions = {
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
            disabled={!isEventEditableOrCancelable(params.row.status, params.row.numberOfRegistration)}
            icon={
              <Box sx={{ '& .action-icon': { color: '#FFC700' } }}>
                <BiEditAlt className="action-icon" />
              </Box>
            }
            onClick={() => {}}
            label="Chỉnh sửa sự kiện"
            showInMenu
          />,
          <GridActionsCellItem
            disabled={!isEventEditableOrCancelable(params.row.status, params.row.numberOfRegistration)}
            icon={<FcCancel />}
            onClick={() => {}}
            label="Hủy sự kiện"
            showInMenu
          />,
          <GridActionsCellItem icon={<FcInfo />} onClick={() => {}} label="Xem chi tiết" showInMenu />,
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
    setPageState((old) => ({ ...old, status: value, page: 1 }));
  };

  const handleSearchEventName = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  const handleFromToDateFilter = (params) => {
    setPageState((old) => ({ ...old, page: 1, dateFrom: params.startDate, dateTo: params.endDate }));
  };

  const handleAddEventDialog = () => {
    setIsAddEventDialogOpen(!isAddEventDialogOpen);
  };

  const handleDetailEventDialog = () => {
    setIsDetailEventDialogOpen(!isDetailEventDialogOpen);
  };

  const addEventDialogContent = () => {
    return <Box></Box>;
  };

  const detailEventDialogContent = () => {
    return <Box></Box>;
  };

  const fetchData = async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));

    const data = await getEvent({
      FilterMode: pageState.filterMode,
      EventType: pageState.eventType,
      Status: pageState.status,
      Page: pageState.page,
      PageSize: pageState.pageSize,
      SearchKey: pageState.searchKey,
      DateFrom: pageState?.dateFrom
        ? moment(pageState?.dateFrom?.toISOString()).utc().local().format('yyyy-MM-DD')
        : '',
      DateTo: pageState?.dateTo ? moment(pageState?.dateTo?.toISOString()).utc().local().format('yyyy-MM-DD') : '',
    });

    const dataRow = data.items?.map((data, i) => ({
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
  }, [pageState.pageSize, pageState.page, pageState.searchKey, pageState.status, pageState.dateFrom, pageState.dateTo]);

  return (
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách sự kiện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách sự kiện' }]}
        />
        {user.role === 'Manager' && (
          <Button startIcon={<HiPlus />} variant="contained" onClick={handleAddEventDialog}>
            Thêm sự kiện
          </Button>
        )}
      </HeaderMainStyle>

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
            defaultValue={pageState.status}
          />

          <InputFilterSectionStyle>
            <FromToDateFilter onChange={handleFromToDateFilter} sx={{ width: '100%' }} />
            <SearchBar
              sx={{ width: '100%' }}
              className="search-bar"
              placeholder="Nhập tên sự kiện"
              onSubmit={handleSearchEventName}
            />
          </InputFilterSectionStyle>
        </FilterSectionStyle>
        <DataTable
          gridOptions={gridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Paper>

      {/* Add Event Dialog */}
      <CustomDialog
        isOpen={isAddEventDialogOpen}
        onClose={handleAddEventDialog}
        title="Thêm sự kiện"
        children={addEventDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />

      {/* Detail Event Dialog */}
      <CustomDialog
        isOpen={isDetailEventDialogOpen}
        onClose={handleDetailEventDialog}
        title="Chi tiết sự kiện"
        children={detailEventDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '500px' } }}
      />
    </div>
  );
};

export default EventListPage;
