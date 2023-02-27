import { Typography, Stack } from '@mui/material';
import { DataTable, CustomSnackBar } from 'components';
import React, { useState, useCallback, useEffect } from 'react';
import { formatDate } from 'utils';
import { getBloodDonations } from 'api';

const BloodDonationHistory = () => {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    // date:""
  });
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

  const gridOptions = {
    columns: [
      {
        headerName: 'STT',
        field: 'no',
        width: 10,
        align: 'center',
      },
      {
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Số đơn vị máu',
        field: 'donationVolume',
        type: 'number',
        width: 300,
      },

      {
        headerName: 'Số túi máu/Số chứng nhận',
        field: 'bloodBagCode',
        type: 'number',
        flex: 1,
        minWidth: 300,
      },
      {
        headerName: 'Ngày hiến',
        field: 'donationDate',
        type: 'string',
        width: 200,
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

  const fetchBloodDonationList = useCallback(async () => {
    const response = await getBloodDonations({ Page: pageState?.page, PageSize: pageState?.pageSize });

    const dataRow = response?.items?.map((data, i) => ({
      no: i + 1,
      id: data?.id,
      donationDate: formatDate(data?.donationDate, 2),
      donationVolume: data?.donationVolume || '-',
      bloodBagCode: data?.bloodBagCode || '-',
    }));

    setPageState((old) => ({ ...old, data: dataRow, total: response.total }));
  }, [pageState?.pageSize, pageState?.page]);

  useEffect(() => {
    fetchBloodDonationList();
  }, [fetchBloodDonationList]);

  return (
    <>
      <Stack>
        <Typography variant="h4" sx={{ marginBottom: '10px', pl: 3 }}>
          Lịch sử hiến máu
        </Typography>
      </Stack>

      <DataTable
        sx={{ paddingTop: '24px' }}
        gridOptions={gridOptions}
        onPageChange={pageChangeHandler}
        onPageSizeChange={pageSizeChangeHandler}
        disableFilter={true}
      />

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
};

export default React.memo(BloodDonationHistory);
