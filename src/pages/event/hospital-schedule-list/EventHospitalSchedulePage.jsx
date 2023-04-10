import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  styled,
  Paper,
} from '@mui/material';
import { HeaderBreadcumbs } from 'components';
import { getEvents } from 'api';
import { HeaderMainStyle, EventTypeEnum, EventFilterEnum } from 'utils';
import DetailRowData from '../components/DetailRowData';
import { NotFoundIcon } from 'assets';

const StyledGridOverlay = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '500px',
  width: '100%',
}));

const EventHospitalSchedulePage = () => {
  const [data, setData] = useState([]);
  const [pagingParams, setPagingParams] = useState({ Page: 0, PageSize: 10 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchEventHospitalScheduleList = useCallback(async () => {
    setIsLoading(true);
    const response = await getEvents({
      FilterMode: EventFilterEnum.FilterAndSearch,
      EventType: EventTypeEnum.PermanentScheduledEvent,
      Page: pagingParams.Page + 1,
      PageSize: pagingParams.PageSize,
      GroupByWeek: true,
    });

    setData(response);
    setIsLoading(false);
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

      {!isLoading ? (
        <Box sx={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden' }}>
          {data?.items?.length > 0 ? (
            <Box>
              <TableContainer component={Box}>
                <Table sx={{ minWidth: 300 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="left"></TableCell>
                      <TableCell align="left">Từ ngày</TableCell>
                      <TableCell align="left">Đến ngày</TableCell>
                      <TableCell align="right">Số lượng sự kiện</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {data?.items?.map((item, i) => <DetailRowData item={item} index={i} />) || (
                      <Box sx={{ height: '439.5px' }}>Không tìm thấy dữ liệu</Box>
                    )}
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
          ) : (
            <StyledGridOverlay>
              <NotFoundIcon height={200} width={200} />
              <Typography fontSize={14} fontWeight={500} sx={{ mt: 1 }}>
                Không tìm thấy dữ liệu
              </Typography>
            </StyledGridOverlay>
          )}
        </Box>
      ) : (
        <Paper sx={{ height: '439.5px', position: 'relative', borderRadius: '20px' }} elevation={1}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </Box>
        </Paper>
      )}
    </>
  );
};

export default EventHospitalSchedulePage;
