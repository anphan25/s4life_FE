import React from 'react';
import { Button, Stack, DialogActions, styled, Box } from '@mui/material';
import { CustomDialog, RHFImport, DataTable, HeaderBreadcumbs } from 'components';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { importCSVHospitalData } from 'api/HospitalApi';

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
              Thêm bệnh viện từ file
            </Button>
          </DialogButtonGroup>
        </Stack>
      </form>
    );
  };

  return (
    <div>
      <HeaderMain>
        <HeaderBreadcumbs
          heading="Danh sách bệnh viện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách bệnh viện' }]}
        />
        <Button sx={{ height: '50px' }} variant="contained" onClick={addHospitalDialogHandler}>
          Thêm bệnh viện
        </Button>
      </HeaderMain>

      {/* Add Hospital Dialog */}
      <CustomDialog
        isOpen={isAddHospitalDialogOpen}
        onClose={addHospitalDialogHandler}
        children={addHospitalDialogContent()}
        title="Thêm bệnh viện"
        sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '400px' } }}
      />
      <DataTable gridOptions={gridOptions} onPageChange={pageChangeHandler} onPageSizeChange={pageSizeChangeHandler} />
    </div>
  );
};

export default HospitalListPage;
