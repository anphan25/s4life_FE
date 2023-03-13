import React, { useState, useEffect } from 'react';
import { HeaderMainStyle } from 'utils';
import { HeaderBreadcumbs } from 'components';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Stack, Button, MenuItem, Paper, Select, Grid, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';

const ChartPaper = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '20px',
}));

const getLastFiveYear = () => {
  const currentYear = Number(moment().get('years'));
  const years = [];

  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    years.push(year);
  }
  return years;
};

const StatisticsPage = () => {
  const theme = useTheme();

  // Total Blood Donation
  const [totalDonationBloodMonths, setTotalDonationBloodMonths] = useState([]);
  const [totalBloodDonation, setTotalBloodDonation] = useState([]);
  const [totalBloodDonationYearFilter, setTotalBloodDonationYearFilter] = useState(getLastFiveYear()[0]);

  // Blood Type Ratio
  const [bloodTypeRatio, setBloodTypeRatio] = useState([]);
  const [bloodTypeRatioYearFilter, setBloodTypeRatioYearFilter] = useState(getLastFiveYear()[0]);

  // Donation Time
  const [donationTimes, setDonationTimes] = useState([]);
  const [donationTimeYearFilter, setDonationTimeYearFilter] = useState(getLastFiveYear()[0]);

  // Blood Bag
  const [bloodBagMonths, setBloodBagMonths] = useState([]);
  const [bloodBags, setBloodBags] = useState([]);
  const [bloodBagYearFilter, setBloodBagYearFilter] = useState(getLastFiveYear()[0]);

  ChartJS?.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

  const mothLabels = {
    1: 'Tháng 1',
    2: 'Tháng 2',
    3: 'Tháng 3',
    4: 'Tháng 4',
    5: 'Tháng 5',
    6: 'Tháng 6',
    7: 'Tháng 7',
    8: 'Tháng 8',
    9: 'Tháng 9',
    10: 'Tháng 10',
    11: 'Tháng 11',
    12: 'Tháng 12',
  };

  //////////////////////// Chart Config ////////////////////

  const barChartOptions = {
    responsive: true,

    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Tổng số lượng máu hiến trong năm ${totalBloodDonationYearFilter}`,
      },
    },
  };

  const barChartData = {
    labels: totalDonationBloodMonths,
    datasets: [
      {
        label: 'Số ml máu',
        data: totalBloodDonation,
        backgroundColor: [theme.palette.primary.main],
      },
    ],
  };
  const bloodTypeRatioPieChartOptions = {
    responsive: true,

    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: `Tỉ lệ nhóm máu năm ${bloodTypeRatioYearFilter}`,
      },
    },
  };

  const bloodTypeRatioPieChartData = {
    labels: ['A', 'B', 'AB', 'O'],
    datasets: [
      {
        label: 'Tỉ lệ nhóm máu',
        data: bloodTypeRatio,
        backgroundColor: [
          theme.palette.error.main,
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
        ],
      },
    ],
  };

  const donationTimePieChartOptions = {
    responsive: true,

    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: `Tỉ lệ số lần hiến máu trong năm ${donationTimeYearFilter}`,
      },
    },
  };

  const donationTimePieChartData = {
    labels: ['1 lần', '2 lần', '3 lần', '4 lần'],
    datasets: [
      {
        label: 'Tỉ lệ số lần hiến máu trong năm',
        data: donationTimes,
        backgroundColor: [
          theme.palette.error.main,
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
        ],
      },
    ],
  };

  const stackedBarChartOptions = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Số lượng túi máu trong năm ${bloodBagYearFilter}`,
      },
    },
  };

  const stackedBarChartData = {
    labels: bloodBagMonths,
    datasets: [
      {
        label: '250ml',
        data: bloodBags?.map((data) => data['volume250']),
        backgroundColor: [theme.palette.error.main],
      },
      {
        label: '350ml',
        data: bloodBags?.map((data) => data['volume350']),
        backgroundColor: [theme.palette.info.main],
      },
      {
        label: '375ml',
        data: bloodBags?.map((data) => data['volume375']),
        backgroundColor: [theme.palette.warning.main],
      },
      {
        label: '450ml',
        data: bloodBags?.map((data) => data['volume450']),
        backgroundColor: [theme.palette.success.main],
      },
    ],
  };

  //////////////////////// Handler Function ////////////////////

  const handelChooseTotalDonationYear = (e) => {
    setTotalBloodDonationYearFilter(e.target.value);
  };

  const handelChooseBloodTypeRatioYear = (e) => {
    setBloodTypeRatioYearFilter(e.target.value);
  };

  const handelChooseDonationTimeYear = (e) => {
    setDonationTimeYearFilter(e.target.value);
  };

  const handelChooseBloodBagYear = (e) => {
    setBloodBagYearFilter(e.target.value);
  };

  useEffect(() => {
    setTotalDonationBloodMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => mothLabels[month]));
    setTotalBloodDonation([1124, 1243, 524, 234, 235, 324, 465, 457, 6746, 460, 537, 3453]);

    setBloodTypeRatio([340, 324, 100, 642]);

    setDonationTimes([1203, 230, 49, 4]);

    setBloodBagMonths(
      [
        { month: 1, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 2, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 3, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 4, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 5, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 6, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 7, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 8, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 9, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 10, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 11, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
        { month: 12, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      ]?.map((data) => mothLabels[data.month])
    );
    setBloodBags([
      { month: 1, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 2, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 3, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 4, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 5, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 6, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 7, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 8, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 9, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 10, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 11, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
      { month: 12, volume250: 340, volume350: 460, volume375: 120, volume450: 45 },
    ]);
  }, []);

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs heading="Thống kê" links={[{ name: 'Trang chủ', to: '/' }, { name: 'Thống kê' }]} />

        {/* <Button startIcon={<Icon icon="solid-plus" />} variant="contained" onClick={handleAddUserDialog}>
          Tải file thống kê
        </Button> */}
      </HeaderMainStyle>

      <Grid container rowSpacing={3} columnSpacing={3}>
        {/* Total Blood Donation */}

        <Grid lg={8} xs={12} item>
          <ChartPaper>
            <Stack direction="row" justifyContent="flex-end">
              <Select
                sx={{ width: '100px', backgroundColor: '#FFFF' }}
                value={totalBloodDonationYearFilter}
                label="Year"
                onChange={handelChooseTotalDonationYear}
              >
                {getLastFiveYear().map((year, i) => (
                  <MenuItem key={i} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Bar options={barChartOptions} data={barChartData} />
          </ChartPaper>
        </Grid>

        {/* Blood Type Ratio Chart */}
        <Grid lg={4} xs={12} item>
          <ChartPaper sx={{ height: '100%' }}>
            <Stack direction="row" justifyContent="flex-end">
              <Select
                sx={{ width: '100px', backgroundColor: '#FFFF', marginBottom: '20px' }}
                value={bloodTypeRatioYearFilter}
                label="Year"
                onChange={handelChooseBloodTypeRatioYear}
              >
                {getLastFiveYear().map((year, i) => (
                  <MenuItem key={i} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Pie options={bloodTypeRatioPieChartOptions} data={bloodTypeRatioPieChartData} />
          </ChartPaper>
        </Grid>

        {/* Donation Time Chart */}
        <Grid lg={4} xs={12} item>
          <ChartPaper sx={{ height: '100%' }}>
            <Stack direction="row" justifyContent="flex-end">
              <Select
                sx={{ width: '100px', backgroundColor: '#FFFF', marginBottom: '20px' }}
                value={donationTimeYearFilter}
                label="Year"
                onChange={handelChooseDonationTimeYear}
              >
                {getLastFiveYear().map((year, i) => (
                  <MenuItem key={i} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Pie options={donationTimePieChartOptions} data={donationTimePieChartData} />
          </ChartPaper>
        </Grid>

        {/* Blood Bags Chart */}
        <Grid lg={8} xs={12} item>
          <ChartPaper>
            <Stack direction="row" justifyContent="flex-end">
              <Select
                sx={{ width: '100px', backgroundColor: '#FFFF' }}
                value={bloodBagYearFilter}
                label="Year"
                onChange={handelChooseBloodBagYear}
              >
                {getLastFiveYear().map((year, i) => (
                  <MenuItem key={i} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Bar options={stackedBarChartOptions} data={stackedBarChartData} />
          </ChartPaper>
        </Grid>
      </Grid>
    </>
  );
};

export default StatisticsPage;
