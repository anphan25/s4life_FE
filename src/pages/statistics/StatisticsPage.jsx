import React, { useState, useEffect } from 'react';
import { HeaderMainStyle, formatNumber } from 'utils';
import { HeaderBreadcumbs } from 'components';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Stack, MenuItem, Paper, Select, Grid, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';
import ChartDetailLegend from './components/ChartDetailLegend';
import { getStatisticData } from 'api';

const ChartPaper = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '20px',
}));

const getLastThreeYear = () => {
  const currentYear = Number(moment().get('years'));
  const years = [];

  for (let i = 0; i < 3; i++) {
    const year = currentYear - i;
    years.push(year);
  }
  return years;
};

const getYearFilterParam = (year) => {
  return { DateStart: `1/1/${year}`, DateEnd: `31/12/${year}` };
};

const StatisticsPage = () => {
  const theme = useTheme();

  // Total Blood Donation
  const [totalDonationBloodMonths, setTotalDonationBloodMonths] = useState([]);
  const [totalBloodDonation, setTotalBloodDonation] = useState([]);
  const [totalBloodDonationYearFilter, setTotalBloodDonationYearFilter] = useState(getLastThreeYear()[0]);

  // Blood Type Ratio
  const [bloodTypeRatio, setBloodTypeRatio] = useState([]);
  const [bloodTypeRatioYearFilter, setBloodTypeRatioYearFilter] = useState(getLastThreeYear()[0]);

  // Blood Bag
  const [bloodBagMonths, setBloodBagMonths] = useState([]);
  const [bloodBags, setBloodBags] = useState([]);
  const [bloodBagYearFilter, setBloodBagYearFilter] = useState(getLastThreeYear()[0]);

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

  const textCenter = {
    id: 'textCenter',
    beforeDatasetsDraw(chart, args, pluginOptions) {
      const { ctx, data } = chart;

      ctx.save();
      ctx.font = '40px Inter,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${formatNumber(6900)}`, chart.getDatasetMeta(0)?.data[0]?.x, chart.getDatasetMeta(0)?.data[0]?.y);
    },
  };

  const bloodTypeRatioDoughnutChartOptions = {
    responsive: true,
    cutout: '80%',
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Tỉ lệ nhóm máu nhận được năm ${bloodTypeRatioYearFilter}`,
      },
    },
  };

  const bloodTypeRatioDoughnutChartData = {
    labels: ['A', 'B', 'AB', 'O'],
    datasets: [
      {
        label: 'Tỉ lệ nhóm máu nhận được',
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

  const handelChooseBloodBagYear = (e) => {
    setBloodBagYearFilter(e.target.value);
  };

  const fetchStatisticData = async () => {
    await getStatisticData({});
  };

  useEffect(() => {
    setTotalDonationBloodMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => mothLabels[month]));
    setTotalBloodDonation([1124, 1243, 524, 234, 235, 324, 465, 457, 6746, 460, 537, 3453]);

    setBloodTypeRatio([340, 324, 100, 642]);

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
      </HeaderMainStyle>

      <Grid container rowSpacing={5} columnSpacing={4}>
        {/* Total Blood Donation */}
        <Grid lg={8} xs={12} item>
          <ChartPaper sx={{ height: '100%' }}>
            <Stack direction="row" justifyContent="flex-end">
              <Select
                sx={{ width: '100px', backgroundColor: '#FFFF' }}
                value={totalBloodDonationYearFilter}
                label="Year"
                onChange={handelChooseTotalDonationYear}
              >
                {getLastThreeYear().map((year, i) => (
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
          <ChartPaper>
            <Stack direction="row" justifyContent="flex-end">
              <Select
                sx={{ width: '100px', backgroundColor: '#FFFF', marginBottom: '20px' }}
                value={bloodTypeRatioYearFilter}
                label="Year"
                onChange={handelChooseBloodTypeRatioYear}
              >
                {getLastThreeYear().map((year, i) => (
                  <MenuItem key={i} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Doughnut
              options={bloodTypeRatioDoughnutChartOptions}
              data={bloodTypeRatioDoughnutChartData}
              plugins={[textCenter]}
            />
            <ChartDetailLegend sx={{ marginTop: '12px' }} />
          </ChartPaper>
        </Grid>

        {/* Blood Bags Chart */}
        <Grid xs={12} item>
          <ChartPaper>
            <Stack direction="row" justifyContent="flex-end">
              <Select
                sx={{ width: '100px', backgroundColor: '#FFFF' }}
                value={bloodBagYearFilter}
                label="Year"
                onChange={handelChooseBloodBagYear}
              >
                {getLastThreeYear().map((year, i) => (
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
