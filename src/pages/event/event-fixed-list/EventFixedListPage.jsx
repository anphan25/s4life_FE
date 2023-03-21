import React, { useState, useEffect, useCallback } from 'react';
import { Button, Box, Typography, Divider, MenuItem } from '@mui/material';
import {
  DataTable,
  HeaderBreadcumbs,
  SearchBar,
  FilterTab,
  CustomDialog,
  FromToDateFilter,
  CustomSnackBar,
  Icon,
  MoreMenuButton,
} from 'components';
import { getEvents, cancelEvent } from 'api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  formatDate,
  errorHandler,
  isEventEditableOrCancelable,
  convertErrorCodeToMessage,
  HeaderMainStyle,
  DialogButtonGroupStyle,
  InputFilterSectionStyle,
  EventTypeEnum,
  EventFilterEnum,
  EventStatusEnum,
  getFilterTabValuesFromEnum,
  RoleEnum,
} from 'utils';
import moment from 'moment';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';

const EventFixedListPage = () => {
  const user = useSelector((state) => state.auth.auth?.user);
  const navigate = useNavigate();
  const [isCancelEventOpen, setIsCancelEventOpen] = useState(false);
  const [cancelEventName, setCancelEventName] = useState('');
  const [cancelEventId, setCancelEventId] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isEditCancelAlertOpen, setIsEditCancelAlertOpen] = useState(false);
  const [connection, setConnection] = useState(null);
  const store = useStore();
  const [pageState, setPageState] = useState({
    isLoading: false,
    total: 0,
    data: [],
    page: 1,
    pageSize: 10,
    filterMode: EventFilterEnum.FilterAndSearch,
    status: EventStatusEnum.Unstarted.value,
    searchKey: '',
    dateFrom: null,
    dateTo: null,
  });

  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

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
        width: 150,
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
        headerName: 'Mã sự kiện',
        field: 'eventCode',
        type: 'string',
        width: 140,
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
        width: 220,
        renderCell: (timeValue) => {
          const valueObject = JSON.parse(timeValue.value);
          const startDate = valueObject?.startDate;
          const endDate = valueObject?.endDate;
          const workingTimeStart = valueObject?.workingTimeStart;
          const workingTimeEnd = valueObject?.workingTimeEnd;
          const isEmergency = valueObject?.isEmergency;

          return (
            <Box>
              {isEmergency ? (
                <>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: 12,
                      mb: '4px',
                    }}
                  >
                    <Typography component={'span'} fontWeight={600} fontSize={13} color="primary.main">
                      {workingTimeStart}
                    </Typography>
                    , {startDate}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: 12,
                    }}
                  >
                    <Typography component={'span'} fontWeight={600} fontSize={13} color="primary.main">
                      {workingTimeEnd}
                    </Typography>
                    , {endDate}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      marginBottom: '4px',
                      fontSize: 12,
                    }}
                  >
                    {startDate} - {endDate}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'primary.main' }}>
                    {workingTimeStart} - {workingTimeEnd}
                  </Typography>
                </>
              )}
            </Box>
          );
        },
      },
      {
        headerName: 'Khẩn cấp',
        type: 'boolean',
        field: 'isEmergency',
        width: 80,
        renderCell: (params) => {
          return (
            <Icon
              icon={params.row.isEmergency ? 'solid-light-emergency-on' : 'solid-light-emergency'}
              sx={{ fontSize: 20, color: params.row.isEmergency ? 'error.main' : 'grey.600' }}
            />
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

              {isManager && (
                <MenuItem
                  disabled={
                    params.row.status === EventStatusEnum.Finished.description ||
                    params.row.status === EventStatusEnum.Cancelled.description ||
                    params.row.isEmergency
                  }
                  onClick={() => {
                    if (
                      !isEventEditableOrCancelable(
                        params.row?.numberOfRegistration,
                        params.row?.startDate,
                        user.role,
                        1
                      )
                    ) {
                      handleEditCancelDialog();
                      return;
                    }

                    navigate(`/event/fixed-list/${params.row.id}/edit`);
                  }}
                >
                  <Icon icon={'solid-pen'} />
                  Cập nhật
                </MenuItem>
              )}

              {(isAdmin || isManager) && (
                <>
                  <Divider sx={{ borderStyle: 'dashed' }} />

                  <MenuItem
                    disabled={
                      params.row.status === EventStatusEnum.Finished.description ||
                      params.row.status === EventStatusEnum.Cancelled.description ||
                      (params.row.isEmergency && isManager)
                    }
                    onClick={() => {
                      if (
                        !isEventEditableOrCancelable(
                          params.row?.numberOfRegistration,
                          params.row?.startDate,
                          user.role,
                          2
                        )
                      ) {
                        handleEditCancelDialog();
                        return;
                      }

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

  const handleEditCancelDialog = () => {
    setIsEditCancelAlertOpen(!isEditCancelAlertOpen);
  };
  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
    setAlert({});
  }, []);

  useEffect(() => {
    listenOnHub(connection, (messageCode) => {
      setAlert({});
      setAlert({
        message: convertErrorCodeToMessage(messageCode),
        type: messageCode < 0 ? 'error' : 'success',
        status: true,
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
          Bạn có chắc chắn muốn hủy sự kiện <b>{cancelEventName}</b> không ?
        </Typography>
        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button onClick={handleCancelEventDialog}>Hủy</Button>
          <LoadingButton
            loading={isButtonLoading}
            onClick={async () => {
              setIsButtonLoading(true);
              setAlert({});
              try {
                await cancelEvent(cancelEventId);
                await fetchEventListData();
              } catch (error) {
                setAlert({ message: errorHandler(error), type: 'error', status: true });
              } finally {
                handleCancelEventDialog();
                setIsButtonLoading(false);
              }
            }}
            variant="contained"
            autoFocus
          >
            Hủy sự kiện
          </LoadingButton>
        </DialogButtonGroupStyle>
      </Box>
    );
  };

  const alertEditCancelDialogContent = () => {
    return (
      <Box>
        <Typography>
          Chỉ được sửa hoặc hủy sự kiện trước 3 ngày sự kiện bắt đầu và sự kiện không có tình nguyện viên đăng ký.
        </Typography>
        <Typography sx={{ marginTop: '10px' }}>
          Vui lòng liên hệ quản trị viên nếu bạn muốn hủy vô điều kiện.
        </Typography>

        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button
            variant="contained"
            onClick={() => {
              handleEditCancelDialog();
            }}
          >
            Ok
          </Button>
        </DialogButtonGroupStyle>
      </Box>
    );
  };

  const fetchEventListData = useCallback(async () => {
    setPageState((pre) => ({ ...pre, isLoading: true }));
    setAlert({});
    getEvents({
      Page: pageState?.page,
      PageSize: pageState?.pageSize,
      FilterMode: pageState?.filterMode,
      Status: pageState?.status,
      EventType: EventTypeEnum.PermanentEvent,
      SearchKey: pageState?.searchKey,
      ...(pageState?.dateFrom && { DateFrom: moment(pageState?.dateFrom).format('yyyy-MM-DD') }),
      ...(pageState?.dateTo && { DateTo: moment(pageState?.dateTo).format('yyyy-MM-DD') }),
    })
      .then((res) => {
        const dataRow = res.items?.map((data) => ({
          id: data?.id,
          name: data?.name || '-',
          eventCode: data?.eventCode || '-',
          address: data.eventLocations[0]?.location?.name || '-',
          time: JSON.stringify({
            startDate: formatDate(data?.startDate, 4),
            endDate: formatDate(data?.endDate, 4),
            workingTimeStart: moment(data?.workingTimeStart, 'HH:mm').format('HH:mm'),
            workingTimeEnd: moment(data?.workingTimeEnd, 'HH:mm').format('HH:mm'),
            isEmergency: data?.isEmergency,
          }),
          startDate: data?.startDate,
          endDate: data?.endDate,
          numberOfRegistration: data?.numberOfRegistration || 0,
          status: data?.status || '',
          isEmergency: data?.isEmergency,
        }));
        setPageState((pre) => ({ ...pre, data: dataRow, total: res.total }));
      })
      .catch((error) => {
        setAlert({ message: errorHandler(error), type: 'error', status: true });
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
          heading="Danh sách sự kiện cố định"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách sự kiện cố định' }]}
        />
        {isManager && (
          <Button
            startIcon={<Icon icon="solid-plus" />}
            variant="contained"
            onClick={() => {
              navigate('/event/fixed-list/add');
            }}
          >
            Tạo sự kiện
          </Button>
        )}
      </HeaderMainStyle>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <FilterTab
            tabs={getFilterTabValuesFromEnum(EventStatusEnum)}
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
      {/* Cancel Event Dialog */}
      <CustomDialog
        isOpen={isCancelEventOpen}
        onClose={handleCancelEventDialog}
        title="Hủy sự kiện"
        children={cancelEventDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />
      {/* Alert Edit/Cancel Event Dialog */}
      <CustomDialog
        isOpen={isEditCancelAlertOpen}
        onClose={handleEditCancelDialog}
        title=""
        children={alertEditCancelDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />
      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
};

export default EventFixedListPage;
