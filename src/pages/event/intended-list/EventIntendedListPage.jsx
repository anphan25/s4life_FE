import React, { useState, useEffect, useCallback } from 'react';
import { Button, Box, Typography, Divider, MenuItem } from '@mui/material';
import {
  DataTable,
  HeaderBreadcumbs,
  SearchBar,
  FilterTab,
  CustomDialog,
  FromToDateFilter,
  Icon,
  MoreMenuButton,
  Tag,
} from 'components';
import { getEvents } from 'api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  formatDate,
  errorHandler,
  convertErrorCodeToMessage,
  HeaderMainStyle,
  InputFilterSectionStyle,
  EventTypeEnum,
  EventFilterEnum,
  EventStatusEnum,
  getValuesFromEnum,
  RoleEnum,
} from 'utils';
import moment from 'moment';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useSnackbar } from 'notistack';
import CancelEventForm from '../components/CancelEventForm';

const EventIntendedListPage = () => {
  const user = useSelector((state) => state.auth.auth?.user);
  const navigate = useNavigate();
  const [isCancelEventOpen, setIsCancelEventOpen] = useState(false);
  const [cancelEventName, setCancelEventName] = useState('');
  const [cancelEventId, setCancelEventId] = useState(0);
  const [connection, setConnection] = useState(null);
  const store = useStore();
  const [pageState, setPageState] = useState({
    isLoading: false,
    total: 0,
    data: [],
    page: 1,
    pageSize: 10,
    filterMode: EventFilterEnum.FilterAndSearch,
    status: EventStatusEnum.Started.value,
    searchKey: '',
    dateFrom: null,
    dateTo: null,
  });
  const { enqueueSnackbar } = useSnackbar();

  const isAdmin = user.role === RoleEnum.Admin.name;
  const isManager = user.role === RoleEnum.Manager.name;

  const gridOptions = {
    columns: [
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Sự kiện',
        type: 'string',
        field: 'name',
        flex: 1,
        renderCell: (nameValue) => {
          return (
            <Typography
              sx={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {nameValue.value}
            </Typography>
          );
        },
      },
      {
        headerName: 'Tỉnh thành triển khai',
        type: 'string',
        field: 'provinceName',
        width: '200',
      },
      {
        headerName: 'Thời gian dự kiến',
        type: 'string',
        field: 'time',
        width: 250,
        renderCell: (timeValue) => {
          const valueObject = JSON.parse(timeValue.value);
          const startDate = valueObject?.startDate;
          const endDate = valueObject?.endDate;

          const isSameDate = startDate === endDate;
          return (
            <Box>
              {isSameDate ? (
                <Typography
                  sx={{
                    fontWeight: 500,
                    marginBottom: '4px',
                    fontSize: 12,
                  }}
                >
                  {startDate}
                </Typography>
              ) : (
                <Typography
                  sx={{
                    fontWeight: 500,
                    marginBottom: '4px',
                    fontSize: 12,
                  }}
                >
                  {startDate} - {endDate}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        headerName: 'Số người đăng ký hiện tại',
        field: 'currentParticipation',
        type: 'string',
        width: 200,
      },
      {
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <MoreMenuButton>
              <MenuItem
                onClick={() => {
                  navigate(`/event/${params.row.id}`);
                }}
              >
                <Icon icon={'solid-eye'} />
                Xem chi tiết
              </MenuItem>

              {(isAdmin || isManager) && (
                <>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <MenuItem
                    disabled={
                      params.row.statusId === EventStatusEnum.Finished.value ||
                      params.row.statusId === EventStatusEnum.Cancelled.value
                    }
                    onClick={() => {
                      handleCancelEventDialog();
                      setCancelEventName(params.row.name);
                      setCancelEventId(params.row.id);
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <Icon icon={'trash'} />
                    Huỷ
                  </MenuItem>
                </>
              )}
            </MoreMenuButton>
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
    setPageState((old) => ({ ...old, status: value, page: 1 }));
  };

  const handleSearchEventName = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  const handleFromToDateFilter = (params) => {
    setPageState((old) => ({ ...old, page: 1, dateFrom: params.startDate, dateTo: params.endDate }));
  };

  const handleCancelEventDialog = async () => {
    setIsCancelEventOpen(!isCancelEventOpen);
  };

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHub(connection, (messageCode) => {
      enqueueSnackbar(convertErrorCodeToMessage(messageCode), {
        variant: messageCode < 0 ? 'error' : 'success',
        persist: false,
      });
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  const cancelEventDialogContent = () => {
    return (
      <Box>
        <Typography>
          Bạn có chắc chắn muốn hủy sự kiện <b>{cancelEventName}</b> không ?<br /> Nếu có vui lòng nhập lý do bên dưới.
        </Typography>

        <CancelEventForm
          eventId={cancelEventId}
          onFinishSubmit={async () => {
            await fetchEventListData();
          }}
          handleCloseDialog={() => {
            handleCancelEventDialog();
          }}
        />
      </Box>
    );
  };

  const fetchEventListData = useCallback(async () => {
    setPageState((pre) => ({ ...pre, isLoading: true }));
    getEvents({
      Page: pageState?.page,
      PageSize: pageState?.pageSize,
      FilterMode: pageState?.filterMode,
      Status: pageState?.status,
      EventType: EventTypeEnum.IntendedEvent,
      SearchKey: pageState?.searchKey,
      ...(pageState?.dateFrom && { DateFrom: moment(pageState?.dateFrom).format('yyyy-MM-DD') }),
      ...(pageState?.dateTo && { DateTo: moment(pageState?.dateTo).format('yyyy-MM-DD') }),
    })
      .then((res) => {
        const dataRow = res.items?.map((data, i) => ({
          id: data?.id,
          name: data?.name || '-',
          time: JSON.stringify({
            startDate: formatDate(data?.startDate, 4),
            endDate: formatDate(data?.endDate, 4),
            workingTimeStart: moment(data?.workingTimeStart, 'HH:mm').format('HH:mm'),
            workingTimeEnd: moment(data?.workingTimeEnd, 'HH:mm').format('HH:mm'),
          }),
          provinceName: data?.intendedProvince?.name || '-',
          startDate: data?.startDate,
          endDate: data?.endDate,
          currentParticipation: data?.currentParticipation || 0,
          statusId: data?.statusId || '',
        }));
        setPageState((pre) => ({ ...pre, data: dataRow, total: res.total }));
      })
      .catch((error) => {
        enqueueSnackbar(errorHandler(error), {
          variant: 'error',
          persist: false,
        });
      })
      .finally(() => setPageState((pre) => ({ ...pre, isLoading: false })));
  }, [pageState.pageSize, pageState.page, pageState.searchKey, pageState.status, pageState.dateFrom, pageState.dateTo]);

  useEffect(() => {
    fetchEventListData();
  }, [fetchEventListData]);

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách sự kiện lưu động dự kiến"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách sự kiện lưu động dự kiến' }]}
        />
        {user.role === 'Manager' && (
          <Button
            startIcon={<Icon icon="solid-plus" />}
            variant="contained"
            onClick={() => {
              navigate('/event/intended-list/add');
            }}
          >
            Tạo sự kiện
          </Button>
        )}
      </HeaderMainStyle>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <FilterTab
            //Intended events do not have Unstarted status
            tabs={getValuesFromEnum(EventStatusEnum).filter((item) => item.value !== EventStatusEnum.Unstarted.value)}
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
        </Box>
        <DataTable
          gridOptions={gridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Box>

      <CustomDialog
        isOpen={isCancelEventOpen}
        onClose={handleCancelEventDialog}
        title="Hủy sự kiện"
        children={cancelEventDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />
    </>
  );
};

export default EventIntendedListPage;
