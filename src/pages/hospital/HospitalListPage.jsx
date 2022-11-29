import { Button, Stack, DialogActions, styled, Box, Typography, Paper } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { CustomDialog, RHFImport, DataTable, HeaderBreadcumbs, CustomSnackBar, FilterTab, SearchBar } from 'components';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { getHospitalsList, importCSVHospitalData, disableHospital, enableHospital } from 'api/HospitalApi';
import { AiOutlineDownload } from 'react-icons/ai';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from 'config/firebaseConfig';
import { HiPlus } from 'react-icons/hi';
import { FcCancel, FcCheckmark } from 'react-icons/fc';
import { formatDate, errorHandler } from 'utils';
import LoadingButton from '@mui/lab/LoadingButton';

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
  [theme.breakpoints.up('sm')]: {
    alignItems: 'center',
  },

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    justifyContent: 'start',
    gap: '20px',
  },
}));

const DownloadLink = styled('a')(({ theme }) => ({
  display: 'none',
}));

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
    { label: 'Bị vô hiệu hóa', value: 2 },
  ];

  const downloadRef = useRef();

  const { handleSubmit, control } = useForm({});

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
        headerName: 'Tên bệnh viện',
        field: 'name',
        type: 'string',
        minWidth: 150,
        flex: 1,
        renderCell: (nameValue) => {
          return <Typography sx={{ fontWeight: '600' }}>{nameValue.value}</Typography>;
        },
      },
      {
        headerName: 'Địa chỉ',
        field: 'address',
        minWidth: 200,
        flex: 2,
      },

      {
        headerName: 'Email',
        field: 'email',
        type: 'string',
        minWidth: 100,
        flex: 0.5,
      },

      {
        headerName: 'Số điện thoại',
        field: 'phoneNumber',
        type: 'string',
        width: 110,
      },
      {
        headerName: 'Ngày thêm',
        field: 'addDate',
        type: 'string',
        width: 140,
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
            icon={<FcCancel />}
            onClick={() => {
              setDisableHospitalId(params.row.id);
              openDisableHospitalConfirm(params.row.name);
            }}
            label="Vô hiệu bệnh viện"
            showInMenu
          />,
          <GridActionsCellItem
            disabled={pageState.filterTabMode === 1}
            icon={<FcCheckmark />}
            onClick={() => {
              setEnableHospitalId(params.row.id);
              openEnableHospitalConfirm(params.row.name);
            }}
            label="Kích hoạt bệnh viện"
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
      console.log('errorHandler(error) ', errorHandler(error));
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
            <Button sx={{ width: '150px' }} startIcon={<AiOutlineDownload />} onClick={handleDownloadTemplate}>
              Tải file mẫu
            </Button>
            <DialogButtonGroup>
              <Button className="dialog_button" onClick={addHospitalDialogHandler}>
                Hủy
              </Button>
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
        no: i + 1,
        id: data.id,
        name: data.name || '-',
        address: data.address || '-',
        email: data.email || '-',
        phoneNumber: data.phoneNumber || '-',
        isActive: data.isActive,
        addDate: formatDate(data.addDate, 1) || '-',
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
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách bệnh viện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách bệnh viện' }]}
        />
        <Button startIcon={<HiPlus />} variant="contained" onClick={addHospitalDialogHandler}>
          Thêm bệnh viện
        </Button>
      </HeaderMainStyle>
      <Paper elevation={1} sx={{ borderRadius: '20px' }}>
        <FilterSectionStyle>
          <FilterTab
            sx={{
              width: '100%',
              // marginBottom: '20px',
              padding: '10px 20px 0',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              backgroundColor: '#F4F6F8',
            }}
            tabs={filterTabValues}
            onChangeTab={handleFilterTabChange}
            defaultValue={pageState.filterTabMode}
          />
        </FilterSectionStyle>
        <SearchBar
          className="search-bar"
          sx={{ margin: '20px' }}
          placeholder="Nhập tên bệnh viện"
          onSubmit={handleSearchHospitalName}
        />
        <DataTable
          gridOptions={gridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Paper>

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
    </div>
  );
};

export default HospitalListPage;
