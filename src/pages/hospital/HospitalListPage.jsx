import { Button, Stack, DialogActions, styled, Box, Typography } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { CustomDialog, RHFImport, DataTable, HeaderBreadcumbs, CustomSnackBar } from 'components';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { getHospitalsList, importCSVHospitalData } from 'api/HospitalApi';
import { AiOutlineDownload } from 'react-icons/ai';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from 'config/firebaseConfig';
import { HiPlus } from 'react-icons/hi';
import { FcCancel } from 'react-icons/fc';
import { formatDateTypeOne } from 'utils/formatDateTypeOne';
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

const HeaderMain = styled(Stack)(({ theme }) => ({
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

const DownloadLink = styled('a')(({ theme }) => ({
  display: 'none',
}));

const HospitalListPage = () => {
  const [isAddHospitalDialogOpen, setIsAddHospitalDialogOpen] = useState(false);
  const [isImportBtnDisabled, setIsImportBtnDisabled] = useState(true);
  const [importParams, setImportParams] = useState([]);
  const [isDisableHospitalOpen, setIsDisableHospitalOpen] = useState(false);
  const [disableHospitalName, setDisableHospitalName] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const downloadRef = useRef();

  const { handleSubmit, control } = useForm({});

  const gridOptions = {
    columns: [
      {
        headerName: 'No',
        field: 'no',
        width: 30,
      },
      {
        headerName: 'Tên bệnh viện',
        field: 'name',
        type: 'string',
        // width: 400,
        flex: 1,
      },
      {
        headerName: 'Địa chỉ',
        field: 'address',
        // width: 300,
        flex: 2,
      },

      {
        headerName: 'Email',
        field: 'email',
        type: 'string',
        // width: 150,
        flex: 1,
      },

      {
        headerName: 'Số điên thoại',
        field: 'phoneNumber',
        type: 'string',
        // width: 100,
        flex: 1,
      },

      {
        headerName: 'Ngày thêm',
        field: 'addDate',
        type: 'string',
        width: 150,
      },
      {
        headerName: 'Người thêm',
        field: 'addUser',
        type: 'string',
        width: 100,
      },
      {
        field: 'actions',
        type: 'actions',
        width: 50,
        sortable: false,
        filterable: false,

        getActions: (params) => [
          <GridActionsCellItem
            icon={<FcCancel />}
            onClick={() => {
              openDisableHospitalConfirm(params.row.name);
            }}
            label="Vô hiệu bệnh viện"
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

  const openDisableHospitalConfirm = (name) => {
    handleDisableHospitalDialog();
    setDisableHospitalName(name);
  };

  const disableHospitalDialogContent = () => {
    return (
      <Box>
        <Typography>
          Bạn có chắc chắn muốn vô hiệu hóa <b>{disableHospitalName}</b> không ?
        </Typography>
        <DialogButtonGroup>
          <Button onClick={handleDisableHospitalDialog}>Hủy</Button>
          <Button
            onClick={async () => {
              handleDisableHospitalDialog();
            }}
            variant="contained"
            autoFocus
          >
            Vô Hiệu Hóa
          </Button>
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
      addHospitalDialogHandler();
      fetchHospitalData();
      setIsButtonLoading(false);
      setAlert({
        message: 'Thêm bệnh viện thành công',
        status: true,
        type: 'success',
      });
    } catch (err) {
      setAlert({});
      setAlert({
        message: 'Thêm bệnh viện không thành công, vui lòng kiểm tra lại tệp tin csv',
        status: true,
        type: 'error',
      });
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
          <Button sx={{ width: '150px' }} startIcon={<AiOutlineDownload />} onClick={handleDownloadTemplate}>
            Tải file mẫu
          </Button>
          <DownloadLink ref={downloadRef} download />
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
            // File doesn't exist
            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
      });
  };
  const fetchHospitalData = () => {
    setPageState((old) => ({ ...old, isLoading: true, data: [] }));
    getHospitalsList({ FilterMode: 'All', Page: pageState.page, PageSize: pageState.pageSize }).then((res) => {
      const dataRow = res.items.map((data, i) => ({
        no: i + 1,
        id: data.id,
        name: data.name || '-',
        address: data.address || '-',
        email: data.email || '-',
        phoneNumber: data.phoneNumber || '-',
        addDate: formatDateTypeOne(data.addDate) || '-',
        addUser: data.addUser || '-',
      }));

      setPageState({ ...pageState, isLoading: false, data: dataRow, total: res.total });
    });
  };

  useEffect(() => {
    setPageState({ ...pageState, isLoading: true });
    fetchHospitalData();
  }, [pageState.pageSize, pageState.page]);

  return (
    <div>
      <HeaderMain>
        <HeaderBreadcumbs
          heading="Danh sách bệnh viện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách bệnh viện' }]}
        />
        <Button startIcon={<HiPlus />} variant="contained" onClick={addHospitalDialogHandler}>
          Thêm bệnh viện
        </Button>
      </HeaderMain>

      <DataTable gridOptions={gridOptions} onPageChange={pageChangeHandler} onPageSizeChange={pageSizeChangeHandler} />

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
        title="Vô hiệu hóa bệnh viện"
        children={disableHospitalDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </div>
  );
};

export default HospitalListPage;
