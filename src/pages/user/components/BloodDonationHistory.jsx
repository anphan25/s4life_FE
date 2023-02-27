import { Typography, Box } from '@mui/material';
import { DataTable, FromToDateFilter } from 'components';
import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { formatDate, InputFilterSectionStyle } from 'utils';
import { getBloodDonations } from 'api';
import moment from 'moment';

const BloodDonationHistory = forwardRef((props, ref) => {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    dateFrom: null,
    dateTo: null,
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
        type: 'string',
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
  const handleFromToDateFilter = (params) => {
    setPageState((old) => ({ ...old, page: 1, dateFrom: params.startDate, dateTo: params.endDate }));
  };

  const fetchBloodDonationList = useCallback(async () => {
    const response = await getBloodDonations({
      Page: pageState?.page,
      PageSize: pageState?.pageSize,
      DateFrom: pageState?.dateFrom ? moment(pageState?.dateFrom).format('yyyy-MM-DD') : '',
      DateTo: pageState?.dateTo ? moment(pageState?.dateTo).format('yyyy-MM-DD') : '',
    });

    const dataRow = response?.items?.map((data, i) => ({
      no: i + 1,
      id: data?.id,
      donationDate: formatDate(data?.donationDate, 2),
      donationVolume: data?.donationVolume || '-',
      bloodBagCode: data?.bloodBagCode || '-',
    }));

    setPageState((old) => ({ ...old, data: dataRow, total: response.total }));
  }, [pageState?.pageSize, pageState?.page, pageState?.dateFrom, pageState?.dateTo]);

  useEffect(() => {
    fetchBloodDonationList();
  }, [fetchBloodDonationList]);

  useImperativeHandle(ref, () => ({
    reloadDonationHistories() {
      fetchBloodDonationList();
    },
  }));

  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: '10px', pl: 3 }}>
        Lịch sử hiến máu
      </Typography>

      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <Box>
          <InputFilterSectionStyle>
            <FromToDateFilter onChange={handleFromToDateFilter} sx={{ width: '100%' }} />
          </InputFilterSectionStyle>
        </Box>
        <DataTable
          sx={{ paddingTop: '24px' }}
          gridOptions={gridOptions}
          onPageChange={pageChangeHandler}
          onPageSizeChange={pageSizeChangeHandler}
          disableFilter={true}
        />
      </Box>
    </>
  );
});

export default React.memo(BloodDonationHistory);
