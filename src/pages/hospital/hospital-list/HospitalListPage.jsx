import { Button, Stack, Box, Typography } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import {
  CustomDialog,
  RHFImport,
  DataTable,
  HeaderBreadcumbs,
  CustomSnackBar,
  FilterTab,
  SearchBar,
  Icon,
} from 'components';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { getHospitalsList, importCSVHospitalData, disableHospital, enableHospital } from 'api';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from 'config';
import { formatDate, errorHandler } from 'utils';
import LoadingButton from '@mui/lab/LoadingButton';
import { DialogButtonGroup, DownloadLink, HeaderMainStyle } from './HospitalListStyle';

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
          return <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{nameValue.value}</Typography>;
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
        headerName: 'Ngày thêm',
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
          switch (pageState.filterTabMode) {
            case 2:
              return (
                <GridActionsCellItem
                  icon={<Icon icon="trash-slash" sx={{ height: 20, width: 20 }} />}
                  onClick={() => {
                    setEnableHospitalId(params.row.id);
                    openEnableHospitalConfirm(params.row.name);
                  }}
                  label="Kích hoạt"
                  showInMenu={false}
                />
              );

            case 1:
              return (
                <GridActionsCellItem
                  icon={<Icon icon="trash" sx={{ height: 20, width: 20, color: 'error.main' }} />}
                  onClick={() => {
                    setDisableHospitalId(params.row.id);
                    openDisableHospitalConfirm(params.row.name);
                  }}
                  label="Vô hiệu hoá"
                  showInMenu={false}
                />
              );
            default:
              return null;
          }
        },
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
          Bạn có chắc chắn muốn vô hiệu hóa <b>{disableHospitalName}</b> không ?
        </Typography>
        <DialogButtonGroup sx={{ marginTop: '10px' }}>
          <Button onClick={handleDisableHospitalDialog}>Hủy</Button>
          <LoadingButton
            loading={isButtonLoading}
            onClick={async () => {
              setAlert({});
              setIsButtonLoading(true);
              try {
                await disableHospital(disableHospitalId);
                await fetchHospitalData();
                setAlert({ message: `Vô hiệu hóa ${disableHospitalName} thành công`, status: true, type: 'success' });
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
            Vô Hiệu Hóa
          </LoadingButton>
        </DialogButtonGroup>
      </Box>
    );
  };

  const enableHospitalDialogContent = () => {
    return (
      <Box>
        <Typography>
          Bạn có chắc chắn muốn kích hoạt <b>{enableHospitalName}</b> không ?
        </Typography>
        <DialogButtonGroup sx={{ marginTop: '10px' }}>
          <Button onClick={handleEnableHospitalDialog}>Hủy</Button>
          <LoadingButton
            loading={isButtonLoading}
            onClick={async () => {
              setAlert({});
              setIsButtonLoading(true);
              try {
                await enableHospital(enableHospitalId);
                await fetchHospitalData();
                setAlert({ message: `Kích hoạt ${enableHospitalName} thành công`, status: true, type: 'success' });
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
        </DialogButtonGroup>
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

    try {
      await importCSVHospitalData(importParams);
      await fetchHospitalData();
      setAlert({
        message: 'Thêm bệnh viện thành công',
        status: true,
        type: 'success',
      });
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
            <DialogButtonGroup>
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
                Thêm
              </LoadingButton>
            </DialogButtonGroup>
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
        switch (error.code) {
          case 'storage/object-not-found':
            setAlert({});
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
    setAlert({});
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

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách bệnh viện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách bệnh viện' }]}
        />
        <Button startIcon={<Icon icon="solid-plus" />} variant="contained" onClick={addHospitalDialogHandler}>
          Thêm bệnh viện
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
        title="Thêm bệnh viện từ file"
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />

      {/* Disable Hospital Dialog */}
      <CustomDialog
        isOpen={isDisableHospitalOpen}
        onClose={handleDisableHospitalDialog}
        title="Vô hiệu bệnh viện"
        children={disableHospitalDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />

      {/* Enable Hospital Dialog */}
      <CustomDialog
        isOpen={isEnableHospitalOpen}
        onClose={handleEnableHospitalDialog}
        title="Kích hoạt bệnh viện"
        children={enableHospitalDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </>
  );
};

export default HospitalListPage;
