import { Button, Stack, Box, Typography, MenuItem } from '@mui/material';
import {
  CustomDialog,
  RHFImport,
  DataTable,
  HeaderBreadcumbs,
  CustomSnackBar,
  FilterTab,
  SearchBar,
  Icon,
  MoreMenuButton,
} from 'components';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { getHospitalsList, importCSVHospitalData, disableHospital, enableHospital } from 'api';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from 'config';
import {
  formatDate,
  errorHandler,
  convertErrorCodeToMessage,
  HeaderMainStyle,
  DialogButtonGroupStyle,
  DEFAULT_HOSPITAL_IMAGE_URL,
} from 'utils';
import LoadingButton from '@mui/lab/LoadingButton';
import { DownloadLink } from './HospitalListStyle';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const HospitalListPage = () => {
  const [isAddHospitalDialogOpen, setIsAddHospitalDialogOpen] = useState(false);
  const [isImportBtnDisabled, setIsImportBtnDisabled] = useState(true);
  const [importParams, setImportParams] = useState([]);
  const [isDisableHospitalOpen, setIsDisableHospitalOpen] = useState(false);
  const [isEnableHospitalOpen, setIsEnableHospitalOpen] = useState(false);
  const [disableHospitalName, setDisableHospitalName] = useState('');
  const [enableHospitalName, setEnableHospitalName] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [disableHospitalId, setDisableHospitalId] = useState(null);
  const [enableHospitalId, setEnableHospitalId] = useState(null);
  const [connection, setConnection] = useState(null);
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    filterTabMode: 1,
    searchKey: '',
  });
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const store = useStore();
  const navigate = useNavigate();

  const filterTabValues = [
    { label: 'Đang hoạt động', value: 1 },
    { label: 'Ngưng hoạt động', value: 2 },
  ];

  const downloadRef = useRef();

  const { handleSubmit, control } = useForm({});

  const gridOptions = {
    columns: [
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Tên bệnh viện',
        field: 'name',
        type: 'string',
        width: 180,
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
        headerName: 'Địa chỉ',
        field: 'address',
        flex: 2,
        minWidth: 220,
      },
      {
        headerName: 'Email',
        field: 'email',
        type: 'string',
        width: 180,
      },

      {
        headerName: 'Số điện thoại',
        field: 'phoneNumber',
        type: 'string',
        width: 140,
      },
      {
        headerName: 'Ngày tạo',
        field: 'addDate',
        type: 'string',
        width: 130,
      },
      {
        field: 'actions',
        type: 'actions',
        sortable: false,
        filterable: false,
        width: 50,
        align: 'center',

        renderCell: (params) => {
          return (
            <MoreMenuButton>
              <MenuItem
                onClick={() => {
                  navigate(`/hospital/${params.row.id}`);
                }}
              >
                <Icon sx={{ height: 20, width: 20 }} icon="eye" />
                Xem chi tiết
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (pageState.filterTabMode === 1) {
                    setDisableHospitalId(params.row.id);
                    openDisableHospitalConfirm(params.row.name);
                  } else {
                    setEnableHospitalId(params.row.id);
                    openEnableHospitalConfirm(params.row.name);
                  }
                }}
              >
                <Icon
                  sx={{ height: 20, width: 20, color: pageState.filterTabMode === 1 ? 'error.main' : '' }}
                  icon={pageState.filterTabMode === 1 ? 'trash' : 'trash-slash'}
                />
                {pageState.filterTabMode === 1 ? 'Vô hiệu' : 'Kích hoạt'}
              </MenuItem>
            </MoreMenuButton>
          );
        },
      },
    ],
    pageState: pageState,
  };

  const pageChangeHandler = (newPage) => {
    setPageState((old) => ({ ...old, page: newPage + 1 }));
  };

  const pageSizeChangeHandler = (newPageSize) => {
    setPageState((old) => ({ ...old, page: 1, pageSize: newPageSize }));
  };

  const addHospitalDialogHandler = () => {
    setIsAddHospitalDialogOpen(!isAddHospitalDialogOpen);
    setIsImportBtnDisabled(true);
  };

  const handleDisableHospitalDialog = () => {
    setIsDisableHospitalOpen(!isDisableHospitalOpen);
  };

  const handleEnableHospitalDialog = () => {
    setIsEnableHospitalOpen(!isEnableHospitalOpen);
  };

  const openDisableHospitalConfirm = (name) => {
    handleDisableHospitalDialog();
    setDisableHospitalName(name);
  };

  const openEnableHospitalConfirm = (name) => {
    handleEnableHospitalDialog();
    setEnableHospitalName(name);
  };

  const handleFilterTabChange = (e, value) => {
    setPageState((old) => ({ ...old, filterTabMode: value, page: 1 }));
  };

  const handleSearchHospitalName = (searchValue) => {
    setPageState((old) => ({ ...old, page: 1, searchKey: searchValue.searchTerm }));
  };

  const disableHospitalDialogContent = () => {
    return (
      <Box>
        <Typography>
          Bạn có chắc chắn muốn vô hiệu <b>{disableHospitalName}</b> không ?
        </Typography>
        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button onClick={handleDisableHospitalDialog}>Hủy</Button>
          <LoadingButton
            loading={isButtonLoading}
            onClick={async () => {
              setAlert({});
              setIsButtonLoading(true);
              try {
                await disableHospital(disableHospitalId);
                await fetchHospitalData();
              } catch (error) {
                setAlert({ message: errorHandler(error), type: 'error', status: true });
              } finally {
                handleDisableHospitalDialog();
                setIsButtonLoading(false);
              }
            }}
            variant="contained"
            autoFocus
          >
            Vô Hiệu
          </LoadingButton>
        </DialogButtonGroupStyle>
      </Box>
    );
  };

  const enableHospitalDialogContent = () => {
    return (
      <Box>
        <Typography>
          Bạn có chắc chắn muốn kích hoạt <b>{enableHospitalName}</b> không ?
        </Typography>
        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Button onClick={handleEnableHospitalDialog}>Hủy</Button>
          <LoadingButton
            loading={isButtonLoading}
            onClick={async () => {
              setAlert({});
              setIsButtonLoading(true);
              try {
                await enableHospital(enableHospitalId);
                await fetchHospitalData();
              } catch (error) {
                setAlert({ message: errorHandler(error), type: 'error', status: true });
              } finally {
                handleEnableHospitalDialog();
                setIsButtonLoading(false);
              }
            }}
            variant="contained"
            autoFocus
          >
            Kích hoạt
          </LoadingButton>
        </DialogButtonGroupStyle>
      </Box>
    );
  };

  const getDataFromFile = (values, disabledBtn) => {
    setImportParams([]);
    setImportParams(values);
    setIsImportBtnDisabled(disabledBtn);
  };

  const onSubmit = async () => {
    if (importParams.length <= 0) {
      return;
    }
    setAlert({});
    setIsButtonLoading(true);
    setImportParams([]);

    const importParamsWithAvatarUrl = importParams?.map((item, i) => ({
      ...item,
      avatarUrl: DEFAULT_HOSPITAL_IMAGE_URL,
    }));

    try {
      await importCSVHospitalData(importParamsWithAvatarUrl);
      await fetchHospitalData();
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      addHospitalDialogHandler();
      setIsButtonLoading(false);
    }
  };

  const addHospitalDialogContent = () => {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          <RHFImport
            control={control}
            name="hospitalFile"
            label="Kéo thả hoặc nhấn vào để chọn file"
            onImport={getDataFromFile}
          />

          <DownloadLink ref={downloadRef} download />
          <Stack direction="row" justifyContent="space-between">
            <Button
              sx={{ width: '150px' }}
              startIcon={<Icon icon="solid-file-download" />}
              onClick={handleDownloadTemplate}
            >
              Tải file mẫu
            </Button>
            <DialogButtonGroupStyle>
              <Box>
                <Button className="dialog_button" onClick={addHospitalDialogHandler}>
                  Hủy
                </Button>
              </Box>
              <LoadingButton
                loading={isButtonLoading}
                disabled={isImportBtnDisabled}
                className="dialog_button"
                sx={{
                  backgroundColor: 'error.main',
                  '&:hover': { backgroundColor: 'error.dark' },
                }}
                type="submit"
                variant="contained"
              >
                Tạo
              </LoadingButton>
            </DialogButtonGroupStyle>
          </Stack>
        </Stack>
      </form>
    );
  };

  const handleDownloadTemplate = async () => {
    getDownloadURL(ref(storage, 'template_import/hospital_import_template.csv'))
      .then((url) => {
        downloadRef.current.setAttribute('href', url);
        downloadRef.current.click();
      })
      .catch((error) => {
        setAlert({});
        switch (error.code) {
          case 'storage/object-not-found':
            setAlert({
              message: 'Không tìm thấy tệp tin để tải về, Vui lòng liên hệ quản trị viên',
              status: true,
              type: 'error',
            });
            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
          default: {
          }
        }
      });
  };
  const fetchHospitalData = useCallback(async () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));
    try {
      const data = await getHospitalsList({
        FilterMode: 'All',
        Page: pageState.page,
        PageSize: pageState.pageSize,
        Status: pageState.filterTabMode === 1,
        SearchKey: pageState.searchKey,
      });

      const dataRow = data.items.map((data, i) => ({
        id: data?.id,
        name: data?.name || '-',
        address: data?.address || '-',
        email: data?.email || '-',
        phoneNumber: data?.phoneNumber || '-',
        isActive: data?.isActive,
        addDate: formatDate(data?.addDate, 4) || '-',
      }));

      setPageState({ ...pageState, data: dataRow, total: data.total });
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setPageState((old) => ({ ...old, isLoading: false }));
    }
  }, [pageState.pageSize, pageState.page, pageState.filterTabMode, pageState.searchKey]);

  useEffect(() => {
    fetchHospitalData();
  }, [fetchHospitalData]);

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHub(connection, (messageCode) => {
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

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách bệnh viện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách bệnh viện' }]}
        />
        <Button startIcon={<Icon icon="solid-plus" />} variant="contained" onClick={addHospitalDialogHandler}>
          Tạo bệnh viện
        </Button>
      </HeaderMainStyle>
      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <FilterTab
            tabs={filterTabValues}
            onChangeTab={handleFilterTabChange}
            defaultValue={pageState.filterTabMode}
          />
          <SearchBar
            className="search-bar"
            sx={{ margin: '20px' }}
            placeholder="Nhập tên bệnh viện"
            onSubmit={handleSearchHospitalName}
          />
        </Box>

        <DataTable
          gridOptions={gridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Box>

      {/* Add Hospital Dialog */}
      <CustomDialog
        isOpen={isAddHospitalDialogOpen}
        onClose={addHospitalDialogHandler}
        children={addHospitalDialogContent()}
        title="Tạo bệnh viện từ file"
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />

      {/* Disable Hospital Dialog */}
      <CustomDialog
        isOpen={isDisableHospitalOpen}
        onClose={handleDisableHospitalDialog}
        title="Vô hiệu bệnh viện"
        children={disableHospitalDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />

      {/* Enable Hospital Dialog */}
      <CustomDialog
        isOpen={isEnableHospitalOpen}
        onClose={handleEnableHospitalDialog}
        title="Kích hoạt bệnh viện"
        children={enableHospitalDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
};

export default HospitalListPage;
