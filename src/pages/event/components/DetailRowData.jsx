import React, { useState } from 'react';
import { Box, TableCell, TableRow, Collapse, Table, TableHead, TableBody } from '@mui/material';
import { formatDate } from 'utils';
import { Icon, Tag } from 'components';

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
        <TableCell align="right">{item?.events.length}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={isDisplayDetail} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày diễn ra</TableCell>
                    <TableCell>Địa điểm</TableCell>
                    <TableCell>Địa chỉ</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {item?.events.map((event) => (
                    <TableRow key={event?.id}>
                      <TableCell sx={{ padding: '10px' }}>{formatDate(event?.startDate, 2)}</TableCell>
                      <TableCell sx={{ padding: '10px' }}>{event?.eventLocations[0]?.location?.name}</TableCell>
                      <TableCell sx={{ padding: '10px' }}>{event?.eventLocations[0]?.location?.address}</TableCell>
                      <TableCell sx={{ padding: '10px' }}>
                        {event?.workingTimeStart} - {event?.workingTimeEnd}
                      </TableCell>
                      <TableCell sx={{ padding: '10px' }}>
                        <Tag status={TagStyleConvert(event?.status)}>{event?.status}</Tag>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default DetailRowData;
