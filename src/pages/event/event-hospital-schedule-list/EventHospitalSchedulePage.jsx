import React, { useState, useEffect, useCallback } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import { HeaderBreadcumbs } from 'components';
import { getEvents } from 'api';
import { HeaderMainStyle } from 'utils';
import DetailRowData from '../components/DetailRowData';
import { useSelector } from 'react-redux';

const EventHospitalSchedulePage = () => {
  const [data, setData] = useState([]);
  const [pagingParams, setPagingParams] = useState({ Page: 0, PageSize: 10 });
  const hospital = useSelector((state) => state.auth.auth?.hospital);

  const fetchEventHospitalScheduleList = useCallback(async () => {
    const response = await getEvents({
      FilterMode: 1,
      EventType: 2,
      Page: pagingParams.Page + 1,
      PageSize: pagingParams.PageSize,
      HospitalId: hospital?.data?.id,
    });

    setData(response);
  }, [pagingParams.Page, pagingParams.PageSize]);

  const onChangePage = (event, newPage) => {
    setPagingParams((old) => ({ ...old, Page: newPage }));
  };
  const onChangeRowsPerPage = (event) => {
    setPagingParams((old) => ({ ...old, PageSize: parseInt(event.target.value, 10), Page: 0 }));
  };

  useEffect(() => {
    fetchEventHospitalScheduleList();
  }, [fetchEventHospitalScheduleList]);

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách sự kiện theo lịch bệnh viện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách sự kiện theo lịch bệnh viện' }]}
        />
      </HeaderMainStyle>

      <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        <TableContainer component={Box}>
          <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left"></TableCell>
                <TableCell align="left">Từ ngày</TableCell>
                <TableCell align="left">Đến ngày</TableCell>
                <TableCell align="right">Số lượng sự kiện</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.items?.map((item, i) => (
                <DetailRowData item={item} index={i} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={data?.total || 10}
          rowsPerPage={pagingParams?.PageSize}
          page={pagingParams?.Page}
          onPageChange={onChangePage}
          onRowsPerPageChange={onChangeRowsPerPage}
        />
      </Box>
    </>
  );
};

export default EventHospitalSchedulePage;
