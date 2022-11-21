import React, { useState } from 'react';
import {
  Paper,
  Grid,
  Stack,
  Box,
  Typography,
  styled,
  Divider,
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  useMediaQuery,
} from '@mui/material';
import { MdOutlineEventNote, MdOutlineWaterDrop } from 'react-icons/md';
import { BsPeople } from 'react-icons/bs';
import { FcProcess } from 'react-icons/fc';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';
import { BsCheck2 } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { formatNumber } from 'utils/formatNumber';
import { TypeOBloodIcon, TypeRHSubtractIcon } from 'assets';
import dayjs from 'dayjs';

const PageTitle = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

  [theme.breakpoints.down('sm')]: {
    display: 'block',
    '& .quarter_box': { width: '70%' },
  },
}));

const StatisticTabContainer = styled(Paper)(({ theme }) => ({
  padding: '20px',
  backgroundColor: theme.palette.background.white,
  boxShadow: '0px 12px 23px rgba(62, 73, 84, 0.04)',
  width: '100%',
  borderRadius: '20px',

  '& .tab_title': {
    '& .tab_title--icon': {
      width: '30px',
      height: '30px',
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      borderRadius: '100%',
      padding: '6px',
      marginRight: '10px',
    },

    '& .tab_title--text': { fontWeight: 500, fontSize: '14px' },
  },

  '& .tab_content': {
    marginTop: '15px',

    '& .tab_content--number': {
      fontWeight: 600,
      fontSize: '32px',
      marginBottom: '10px',

      [theme.breakpoints.down('lg')]: {
        textAlign: 'center',
      },
    },
  },

  '& .status_box': {
    '& .status_title': {
      marginBottom: '8px',
      '& .status_icon': { marginRight: '8px' },
      '& .fail': { color: theme.palette.error.main },
      '& .success': { color: theme.palette.success.main },
      '& .status_text': { fontWeight: 600, fontSize: '14px' },
    },

    '& .status_number': {
      textAlign: 'center',
      fontSize: '14px',
      color: theme.palette.grey[600],
    },
  },
}));

const IncomingEventStyle = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '20px',
}));

const BloodVolume = styled(Paper)(({ theme }) => ({
  padding: '40px 20px 40px',
  borderRadius: '20px',

  '& .blood_volume--content': {
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },

  '& .blood-type': {
    padding: '8px',
    backgroundColor: theme.palette.error.light,
    width: '55px',
    height: '55px',
    borderRadius: '10px',
    marginRight: '10px',

    [theme.breakpoints.down('lg')]: {
      marginRight: 0,
      marginBottom: '10px',
    },
  },

  '& .blood_volume--item': {
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },

    '& .blood-volume-number': { fontWeight: 600, fontSize: '20px' },
  },
}));

const DashboardPage = () => {
  const theme = useTheme();

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

  return (
    <Box sx={{ width: '100%' }}>
      <PageTitle sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Trang chủ
        </Typography>
        <Paper className="quarter_box" elevation={0} sx={{ padding: '10px' }}>
          <Typography>
            {dayjs('2001-09-05T00:00:00').locale('vi').format('MMMM, YYYY')} -{' '}
            {dayjs('2001-12-05T00:00:00').locale('vi').format('MMMM, YYYY')}
          </Typography>
        </Paper>
      </PageTitle>

      {/* Total Tab */}
      <Grid container rowSpacing={4} columnSpacing={{ xl: 5, lg: 3 }} sx={{ marginBottom: '50px' }}>
        <Grid lg={4} xs={12} item>
          <StatisticTabContainer elevation={0}>
            <Stack className="tab_title" direction="row" alignItems="center">
              <MdOutlineEventNote className="tab_title--icon" />
              <Typography className="tab_title--text">Số sự kiện</Typography>
            </Stack>

            <Stack className="tab_content">
              <Typography className="tab_content--number">{formatNumber(50041)}</Typography>

              <Stack className="tab_content--status" direction="row" spacing={3} justifyContent="center">
                <Box className="status_box">
                  <Stack className="status_title" direction="row" alignItems="center" justifyContent="center">
                    <BsCheck2 className="status_icon success" />
                    <Typography className="status_text">Đã hoàn thành</Typography>
                  </Stack>
                  <Typography className="status_number">{formatNumber(5000)}</Typography>
                </Box>

                <Box>
                  <Divider orientation="vertical" />
                </Box>

                <Box className="status_box">
                  <Stack className="status_title" direction="row" alignItems="center" justifyContent="center">
                    <IoMdClose className="status_icon fail" />
                    <Typography className="status_text">Chưa hoàn thành</Typography>
                  </Stack>
                  <Typography className="status_number">{formatNumber(5000)}</Typography>
                </Box>
              </Stack>
            </Stack>
          </StatisticTabContainer>
        </Grid>

        <Grid lg={4} xs={12} item>
          <StatisticTabContainer elevation={0}>
            <Stack className="tab_title" direction="row" alignItems="center">
              <BsPeople className="tab_title--icon" />
              <Typography className="tab_title--text">Số lượt hiến máu</Typography>
            </Stack>

            <Stack className="tab_content">
              <Typography className="tab_content--number">{formatNumber(5000)}</Typography>

              <Stack className="tab_content--status" direction="row" spacing={3} justifyContent="center">
                <Box className="status_box">
                  <Stack className="status_title" direction="row" alignItems="center" justifyContent="center">
                    <BsCheck2 className="status_icon success" />
                    <Typography className="status_text">Đã hiến máu</Typography>
                  </Stack>
                  <Typography className="status_number">{formatNumber(5000)}</Typography>
                </Box>

                <Box>
                  <Divider orientation="vertical" />
                </Box>

                <Box className="status_box">
                  <Stack className="status_title" direction="row" alignItems="center">
                    <IoMdClose className="status_icon fail" />
                    <Typography className="status_text">Chưa hiến máu</Typography>
                  </Stack>
                  <Typography className="status_number">{formatNumber(5000)}</Typography>
                </Box>
              </Stack>
            </Stack>
          </StatisticTabContainer>
        </Grid>

        <Grid lg={4} xs={12} item>
          <StatisticTabContainer elevation={0}>
            <Stack className="tab_title" direction="row" alignItems="center">
              <MdOutlineWaterDrop className="tab_title--icon" />
              <Typography className="tab_title--text">Số (lit) máu nhận được</Typography>
            </Stack>

            <Stack className="tab_content">
              <Typography className="tab_content--number">{formatNumber(500000)}</Typography>

              <Stack className="tab_content--status" direction="row" spacing={3} justifyContent="center">
                <Box className="status_box">
                  <Stack className="status_title" direction="row" alignItems="center" justifyContent="center">
                    <BsCheck2 className="status_icon success" />
                    <Typography className="status_text">Đã nhận được</Typography>
                  </Stack>
                  <Typography className="status_number">{formatNumber(5000)}</Typography>
                </Box>

                <Box>
                  <Divider orientation="vertical" />
                </Box>

                <Box className="status_box">
                  <Stack className="status_title" direction="row" alignItems="center">
                    <FcProcess className="status_icon fail" />
                    <Typography className="status_text">Dự kiến nhận</Typography>
                  </Stack>
                  <Typography className="status_number">{formatNumber(5000)}</Typography>
                </Box>
              </Stack>
            </Stack>
          </StatisticTabContainer>
        </Grid>
      </Grid>

      <Grid container rowSpacing={4} columnSpacing={{ lg: 2 }}>
        <Grid item lg={9} xs={12}>
          <IncomingEventStyle elevation={0}>
            <Typography sx={{ fontWeight: 800, fontSize: '20px', marginBottom: '10px' }}>
              Sự kiện hiến máu sắp diễn ra
            </Typography>

            <TableContainer component={Box}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead sx={{ borderBottom: '1px solid #EBEAED' }}>
                  <TableRow>
                    <TableCell sx={{ boxShadow: 'none !important', width: '30%', fontWeight: 'bold' }}>
                      Sự kiện
                    </TableCell>
                    <TableCell sx={{ width: '40%', fontWeight: 'bold' }}>Địa điểm</TableCell>
                    <TableCell sx={{ boxShadow: 'none !important', width: '30%', fontWeight: 'bold' }}>
                      Thời gian
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {row.address}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Box>
                          <Typography>
                            {moment(row.startDate).format('DD/MM/yyyy')} - {moment(row.endDate).format('DD/MM/yyyy')}
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '12px',
                              color: `${theme.palette.success.main}`,
                            }}
                          >
                            {moment(row.startDate).format('HH:mm')} - {moment(row.endDate).format('HH:mm')}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </IncomingEventStyle>
        </Grid>
        <Grid item lg={3} xs={12}>
          <BloodVolume>
            <Stack className="blood_volume--content">
              <Stack className="blood_volume--item" direction="row">
                <TypeOBloodIcon className="blood-type" />
                <Box>
                  <Typography className="blood-volume-number">{formatNumber(60034)} lít</Typography>
                  <Typography>Nhóm máu O</Typography>
                </Box>
              </Stack>

              <Divider
                flexItem={true}
                orientation={useMediaQuery(theme.breakpoints.down('lg')) ? 'vertical' : 'horizontal'}
                sx={{
                  margin: '30px 0 30px',
                  [theme.breakpoints.down('lg')]: {
                    margin: '0 40px 0',
                  },
                }}
              />

              <Stack className="blood_volume--item" direction="row">
                <TypeRHSubtractIcon className="blood-type" />
                <Box>
                  <Typography className="blood-volume-number">{formatNumber(60034)} lít</Typography>
                  <Typography>Nhóm máu RH-</Typography>
                </Box>
              </Stack>
            </Stack>
          </BloodVolume>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
