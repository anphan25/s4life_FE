import { Button, Stack, DialogActions, styled, Box, TablePagination } from '@mui/material';
import { CustomDialog, RHFImport, DataTable, HeaderBreadcumbs } from 'components';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { importCSVHospitalData } from 'api/HospitalApi';
import { AiOutlineDownload } from 'react-icons/ai';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from 'config/firebaseConfig';
import axios from 'axios';
import { HiPlus } from 'react-icons/hi';

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
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const downloadRef = useRef();

  const { handleSubmit, control } = useForm({});

  const gridOptions = {
    columns: [
      {
        headerName: 'No',
        field: 'no',
        width: 70,
      },
      {
        headerName: 'Tên bệnh viện',
        field: 'pictureUrl',
        type: 'string',
        width: 400,
      },
      {
        headerName: 'Địa chỉ',
        field: 'fullName',
        width: 300,
      },

      {
        headerName: 'Email',
        field: 'email',
        type: 'string',
        width: 150,
      },

      {
        headerName: 'Số điên thoại',
        field: 'phoneNumber',
        type: 'string',
        width: 100,
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
  };

  const getDataFromFile = (values, disabledBtn) => {
    setImportParams([]);
    setImportParams(values);
    setIsImportBtnDisabled(disabledBtn);
  };

  const onSubmit = async () => {
    console.log('csv data: ', importParams);
    if (importParams.length <= 0) {
      return;
    }

    try {
      await importCSVHospitalData(importParams);
      addHospitalDialogHandler();
      setImportParams([]);
      setIsImportBtnDisabled(true);
    } catch (err) {
      console.log(err);
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
            <Button
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
            </Button>
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
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
      });
  };

  useEffect(() => {}, []);

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

      {/* Add Hospital Dialog */}
      <CustomDialog
        isOpen={isAddHospitalDialogOpen}
        onClose={addHospitalDialogHandler}
        children={addHospitalDialogContent()}
        title="Thêm bệnh viện từ file"
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '500px' } }}
      />
      <DataTable gridOptions={gridOptions} onPageChange={pageChangeHandler} onPageSizeChange={pageSizeChangeHandler} />
    </div>
  );
};

export default HospitalListPage;
