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
} from '@mui/material';
import { MoreMenuButton, Icon } from 'components';
import moment from 'moment';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from 'utils';

const rows = [
  {
    name: 'Hiến máu cho người nghèo',
    address: '60 Lê Văn Việt, Phường Hiệp Phú, Quận 9, Tp Hồ Chí Minh',
    startDate: new Date(),
    endDate: new Date(),
  },
  {
    name: 'Hiến máu cho người nghèo, người khuyết tật, người thiếu máu',
    address: '60 Lê Văn Việt, Phường Hiệp Phú, Quận 9, Tp Hồ Chí Minh',
    startDate: new Date(),
    endDate: new Date(),
  },
];

const NewEventList = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ py: 3, borderRadius: '20px', backgroundColor: 'white' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '20px', marginBottom: '20px', mx: 3 }}>
        Sự kiện hiến máu mới
      </Typography>

      <TableContainer sx={{ width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sự kiện</TableCell>
              <TableCell>Địa điểm</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>
                  <Box>
                    <Typography sx={{ fontSize: 12 }} whiteSpace="nowrap">
                      {formatDate(row.startDate, 4)} - {formatDate(row.endDate, 4)}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'primary.main' }}>
                      {moment(row.startDate).format('HH:mm')} - {moment(row.endDate).format('HH:mm')}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <MoreMenuButton>
                    <MenuItem>
                      <Icon icon={'eye'} />
                      Xem chi tiết
                    </MenuItem>

                    <MenuItem>
                      <Icon icon={'pen'} />
                      Cập nhật
                    </MenuItem>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    <MenuItem sx={{ color: 'error.main' }}>
                      <Icon icon={'trash'} />
                      Huỷ
                    </MenuItem>
                  </MoreMenuButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default NewEventList;
