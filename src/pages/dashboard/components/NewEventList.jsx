import {
  Box,
  Button,
  Divider,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material';
import { MoreMenuButton, Icon } from 'components';
import moment from 'moment';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, EventTypeEnum } from 'utils';

const NewEventList = ({ events }) => {
  const navigate = useNavigate();
  return (
    <Box sx={{ py: 3, borderRadius: '20px', backgroundColor: 'white' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '20px', marginBottom: '20px', mx: 3 }}>
        Sự kiện hiến máu mới
      </Typography>

      {events.length > 0 ? (
        <TableContainer sx={{ width: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="30%">Sự kiện</TableCell>
                <TableCell width="50%">Địa điểm/Khu vực</TableCell>
                <TableCell width="20%">Thời gian</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {events?.map((row) => (
                <TableRow key={row?.id}>
                  <TableCell>{row?.name}</TableCell>
                  <TableCell>
                    {row?.eventTypeId === EventTypeEnum.MobileEvent
                      ? row?.area
                          .map((item) => {
                            return item?.districtName;
                          })
                          .join(', ')
                          .concat(' - ', row?.area[0]?.provinceName)
                      : row?.eventLocations[0]?.location?.address}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography sx={{ fontSize: 12 }} whiteSpace="nowrap">
                        {formatDate(row?.startDate, 4)} - {formatDate(row?.endDate, 4)}
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'primary.main' }}>
                        {moment(row?.startDate).format('HH:mm')} - {moment(row?.endDate).format('HH:mm')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <MoreMenuButton>
                      <MenuItem>
                        <Icon
                          icon={'solid-eye'}
                          onClick={() => {
                            navigate('/event/fixed-list');
                          }}
                        />
                        Xem chi tiết
                      </MenuItem>
                    </MoreMenuButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box textAlign="center" height="200px">
          <CircularProgress sx={{ marginTop: '80px' }} />
        </Box>
      )}

      <Divider />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          onClick={() => navigate('/event/fixed-list/')}
          sx={{ padding: '4px 8px', borderRadius: 1 }}
          endIcon={<Icon icon={'solid-angles-right-small'} />}
        >
          Xem tất cả
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(NewEventList);
