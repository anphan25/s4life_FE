import React from 'react';
import { Button, Stack, DialogActions, styled, Box } from '@mui/material';
import { CustomDialog, RHFInput, RHFAutoComplete, DataTable, HeaderBreadcumbs } from 'components';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

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

const AddHospitalSchema = Yup.object().shape({
  name: Yup.string().required('Vui lòng nhập tên bệnh viện'),
  province: Yup.string().required('Vui lòng chọn tỉnh/thành'),
  district: Yup.string().required('Vui lòng chọn quận/huyện'),
  ward: Yup.string().required('Vui lòng chọn phường/xã'),
});

const defaultValues = { name: '', province: '', district: '', ward: '' };
const dummySelectMenu = ['Tp HCM', 'Long An', 'Tiền Giang', 'Hà Nội', 'Đà Nẵng'];

const HospitalListPage = () => {
  const [isAddHospitalDialogOpen, setIsAddHospitalDialogOpen] = useState(false);
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(AddHospitalSchema),
    defaultValues,
  });

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

  const onSubmit = async (data) => {};

  const addHospitalDialogContent = () => {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <RHFInput control={control} label="Tên bệnh viện" name="name" />
          <Stack spacing={2}>
            <RHFAutoComplete name="province" options={dummySelectMenu} control={control} label="Tỉnh/Thành" />
            <RHFAutoComplete name="district" options={dummySelectMenu} control={control} label="Quận/Huyện" />
            <RHFAutoComplete name="ward" options={dummySelectMenu} control={control} label="Phường/Xã" />
          </Stack>
          <RHFInput control={control} label="Địa chỉ" name="street" />
          <DialogButtonGroup>
            <Button className="dialog_button" onClick={addHospitalDialogHandler}>
              Hủy
            </Button>
            <Button
              className="dialog_button"
              sx={{
                backgroundColor: 'error.main',
                '&:hover': { backgroundColor: 'error.dark' },
              }}
              type="submit"
              variant="contained"
            >
              Thêm bệnh viện
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
          heading="Danh sách người dùng"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách người dùng' }]}
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
        sx={{ '& .MuiDialog-paper': { width: '70%', height: '500px' } }}
      />
      <DataTable gridOptions={gridOptions} onPageChange={pageChangeHandler} onPageSizeChange={pageSizeChangeHandler} />
    </div>
  );
};

export default HospitalListPage;
