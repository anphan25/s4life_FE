import React, { useState, useEffect } from 'react';
import { Stack, styled, Button, Box, Paper, Typography, DialogActions } from '@mui/material';
import { HiPlus } from 'react-icons/hi';
import {
  DataTable,
  HeaderBreadcumbs,
  SearchBar,
  FilterTab,
  CustomDialog,
  FromToDateFilter,
  CustomSnackBar,
} from 'components';
import { formatDate } from 'utils/formatDate';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { FcCancel, FcInfo } from 'react-icons/fc';
import { AiFillEdit } from 'react-icons/ai';
import { getEvent } from 'api/EventApi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '@mui/lab/LoadingButton';
import { cancelEvent } from 'api/EventApi';

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

const DialogButtonGroup = styled(DialogActions)(({ theme }) => ({
  marginTop: 'auto',
  padding: '10px 0px 10px !important',

  [theme.breakpoints.down('sm')]: {
    margin: '0 auto',
    '& .dialog_button': {
      fontSize: '10px',
    },
  },
}));

const filterTabValues = [
  { label: 'Chưa diễn ra', value: 1 },
  { label: 'Đang diễn ra', value: 2 },
  { label: 'Đã kết thúc', value: 3 },
  { label: 'Đã hủy', value: 4 },
];

const isEventEditableOrCancelable = (status, numberOfRegistration) => {
  if (status === 'Đã kết thúc' || status === 'Đã bị hủy') {
    return false;
  }

  if (numberOfRegistration > 0) {
    return false;
  }

  return true;
};

const EventListPage = () => {
  let user = useSelector((state) => state.auth.auth?.user);
  const navigate = useNavigate();
  const [isCancelEventOpen, setIsCancelEventOpen] = useState(false);
  const [cancelEventName, setCancelEventName] = useState('');
  const [cancelEventId, setCancelEventId] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

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

  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
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

        renderCell: (nameValue) => {
          return <Typography sx={{ fontWeight: 'bold' }}>{nameValue.value}</Typography>;
        },
      },
      {
        headerName: 'Mã sự kiện',
        field: 'eventCode',
        type: 'string',
        width: 100,
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
        width: 250,
        renderCell: (timeValue) => {
          const dateTime = timeValue.value.split(', ');
          const date = dateTime[0];
          const time = dateTime[1];
          return (
            <Box>
              <Typography
                sx={{
                  backgroundColor: '#F4F4F4',
                  fontWeight: 600,
                  padding: '3px 5px 3px',
                  borderRadius: '8px',
                  marginBottom: '5px',
                }}
              >
                {date}
              </Typography>
              <Typography sx={{ color: '#2BC155' }}>{time}</Typography>
            </Box>
          );
        },
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
                <AiFillEdit className="action-icon" />
              </Box>
            }
            onClick={() => {
              navigate(`/event/${params.row.id}/edit`);
            }}
            label="Sửa sự kiện"
            showInMenu
          />,
          <GridActionsCellItem
            disabled={!isEventEditableOrCancelable(params.row.status, params.row.numberOfRegistration)}
            icon={<FcCancel />}
            onClick={() => {
              handleCancelEventDialog();
              setCancelEventName(params.row.name);
              setCancelEventId(params.row.id);
            }}
            label="Hủy sự kiện"
            showInMenu
          />,
          <GridActionsCellItem
            icon={<FcInfo />}
            onClick={() => {
              navigate(`/event/${params.row.id}`);
            }}
            label="Xem chi tiết"
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
    setPageState((old) => ({ ...old, status: value, page: 1 }));
  };

  const handleSearchEventName = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  const handleFromToDateFilter = (params) => {
    setPageState((old) => ({ ...old, page: 1, dateFrom: params.startDate, dateTo: params.endDate }));
  };

  const handleCancelEventDialog = () => {
    setIsCancelEventOpen(!isCancelEventOpen);
  };

  const cancelEventDialogContent = () => {
    return (
      <Box>
        <Typography>
          Bạn có chắc chắn muốn hủy sự kiện <b>{cancelEventName}</b> không ?
        </Typography>
        <DialogButtonGroup sx={{ marginTop: '10px' }}>
          <Button onClick={handleCancelEventDialog}>Hủy</Button>
          <LoadingButton
            loading={isButtonLoading}
            onClick={async () => {
              setAlert({});
              setIsButtonLoading(true);
              try {
                await cancelEvent(cancelEventId);
                handleCancelEventDialog();
                setAlert({ message: `Hủy sự kiện ${cancelEventName} thành công`, status: true, type: 'success' });
                await fetchData();
                setIsButtonLoading(false);
              } catch (e) {}
            }}
            variant="contained"
            autoFocus
          >
            Hủy sự kiện
          </LoadingButton>
        </DialogButtonGroup>
      </Box>
    );
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
      time: `${formatDate(data.startDate, 2)} - ${formatDate(data.endDate, 2)}, ${moment(
        data.workingTimeStart,
        'HH:mm'
      ).format('HH:mm')} - ${moment(data.workingTimeEnd, 'HH:mm').format('HH:mm')}`,
      numberOfRegistration: data.numberOfRegistration || 0,
      status: data.status || '',
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
          heading="Danh sách sự kiện cố định"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách sự kiện cố định' }]}
        />
        {user.role === 'Manager' && (
          <Button
            startIcon={<HiPlus />}
            variant="contained"
            onClick={() => {
              navigate('/event/add');
            }}
          >
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
            <FromToDateFilter onChange={handleFromToDateFilter} sx={{ width: '50%' }} />
            <SearchBar
              sx={{ width: '50%' }}
              className="search-bar"
              placeholder="Nhập tên sự kiện"
              onSubmit={handleSearchEventName}
            />
          </InputFilterSectionStyle>
        </FilterSectionStyle>
        <DataTable
          density="comfortable"
          gridOptions={gridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Paper>

      {/* Cancel Event Dialog */}
      <CustomDialog
        isOpen={isCancelEventOpen}
        onClose={handleCancelEventDialog}
        title="Hủy sự kiện"
        children={cancelEventDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </div>
  );
};

export default EventListPage;
