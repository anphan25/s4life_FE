import React, { useState, useEffect, useCallback } from 'react';
import { Box, TableCell, TableRow, Collapse, Table, TableHead, TableBody, CircularProgress } from '@mui/material';
import { formatDate } from 'utils';
import { Icon, Tag } from 'components';
import { useNavigate } from 'react-router-dom';
import { getEvents } from 'api';

const TagStyleConvert = (status, theme) => {
  switch (status) {
    case 'Chưa bắt đầu': {
      return 'warning';
    }
    case 'Đã bắt đầu': {
      return 'success';
    }
    case 'Đã kết thúc': {
      return 'info';
    }
    case 'Đã bị hủy': {
      return 'error';
    }

    default: {
    }
  }
};

const DetailRowData = ({ item, index }) => {
  const [isDisplayDetail, setIsDisplayDetail] = useState(false);
  const [events, setEvents] = useState([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const navigate = useNavigate();

  const fetchEventListInWeekGroup = useCallback(async () => {
    if (!isDisplayDetail) return;
    setIsDetailLoading(true);

    const response = await getEvents({
      FilterMode: 2,
      EventType: 2,
      DateFrom: item?.startWeek,
      DateTo: item?.endWeek,
      GroupByWeek: false,
    });

    setEvents(response?.items);
    setIsDetailLoading(false);
  }, [isDisplayDetail]);

  useEffect(() => {
    fetchEventListInWeekGroup();
  }, [fetchEventListInWeekGroup]);

  return (
    <React.Fragment key={index}>
      <TableRow
        onClick={() => setIsDisplayDetail(!isDisplayDetail)}
        sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }}
      >
        <TableCell align="left">
          <Icon
            icon="solid-angle-down-small"
            sx={{
              transform: isDisplayDetail ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease',
            }}
          />
        </TableCell>
        <TableCell component="th" scope="row">
          {formatDate(item?.startWeek, 2)}
        </TableCell>
        <TableCell component="th" scope="row">
          {formatDate(item?.endWeek, 2)}
        </TableCell>
        <TableCell align="right">{item?.totalEvent}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={isDisplayDetail} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày diễn ra</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Đã hiến máu/Tổng lượt đăng ký</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                {isDetailLoading ? (
                  <TableBody sx={{ height: '268.6px', position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <CircularProgress />
                    </Box>
                  </TableBody>
                ) : (
                  <TableBody>
                    {events?.map((event) => (
                      <TableRow key={event?.id}>
                        <TableCell sx={{ padding: '10px' }}>{formatDate(event?.startDate, 2)}</TableCell>
                        <TableCell sx={{ padding: '10px' }}>
                          {event?.workingTimeStart} - {event?.workingTimeEnd}
                        </TableCell>

                        <TableCell sx={{ padding: '10px' }}>
                          <Tag status={TagStyleConvert(event?.status)}>{event?.status}</Tag>
                        </TableCell>
                        <TableCell sx={{ padding: '10px' }}>
                          {event?.numberOfDonatedVolunteer}/{event?.numberOfRegistration}
                        </TableCell>
                        <TableCell>
                          <Icon
                            sx={{ cursor: 'pointer' }}
                            icon="solid-eye"
                            onClick={() => {
                              navigate(`/event/${event?.id}`);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default DetailRowData;
