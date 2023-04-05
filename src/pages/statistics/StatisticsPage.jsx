import React, { useState, useEffect, useCallback } from 'react';
import {
  HeaderMainStyle,
  formatNumber,
  StatisticFilterModeEnum,
  getStatisticResultFromGroup,
  StatisticEnum,
} from 'utils';
import { getYearFilterParam, getLastThreeYear } from 'utils/extensions/year';
import { HeaderBreadcumbs } from 'components';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Stack, MenuItem, Paper, Select, Grid, styled, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';
import ChartDetailLegend from './components/ChartDetailLegend';
import { getStatisticData } from 'api';
import { NotFoundIcon } from 'assets';

const StyledGridOverlay = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '337px',

  [theme.breakpoints.down('md')]: {
    height: '200px',
  },
}));

const ChartPaper = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '20px',
}));

const currentYear = Number(moment().get('years'));

const mothLabels = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const bloodVolumeRatioCalculator = (partialValue, totalValue) => {
  const result = (100 * partialValue) / totalValue || 0;

  return result;
};

const StatisticsPage = () => {
  const theme = useTheme();

  // Total Blood Donation
  const [totalBloodDonation, setTotalBloodDonation] = useState([]);
  const [totalBloodDonationYearFilter, setTotalBloodDonationYearFilter] = useState(getLastThreeYear(currentYear)[0]);

  // Blood Type Ratio
  const [bloodTypeRatio, setBloodTypeRatio] = useState([]);
  const [bloodTypeRatioYearFilter, setBloodTypeRatioYearFilter] = useState(getLastThreeYear(currentYear)[0]);
  const [totalVolume, setTotalVolume] = useState(0);

  // Blood Bag
  const [bloodBags, setBloodBags] = useState([]);
  const [bloodBagYearFilter, setBloodBagYearFilter] = useState(getLastThreeYear(currentYear)[0]);

  ChartJS?.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

  //////////////////////// Chart Config ////////////////////

  //////////// Bar Chart
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
    labels: mothLabels,
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
      ctx.fillText(
        `${formatNumber(totalVolume)}ml`,
        chart.getDatasetMeta(0)?.data[0]?.x,
        chart.getDatasetMeta(0)?.data[0]?.y
      );
    },
  };

  //////////// Doughnut Chart

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
        data: bloodTypeRatio?.map((data) => data.volume) || [],
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

  //////////// Stacked Bar Chart

  const stackedBarChartData = {
    labels: mothLabels,
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

  const fetchTotalBloodDonation = useCallback(async () => {
    const response = await getStatisticData(
      StatisticFilterModeEnum.BloodVolumeStatistic,
      getYearFilterParam(totalBloodDonationYearFilter).DateStart,
      getYearFilterParam(totalBloodDonationYearFilter).DateEnd,
      true
    );

    const totalBloodVolumePerMonth = response?.statistics?.map((data) =>
      getStatisticResultFromGroup(data?.bloodVolumeStatistics, StatisticEnum.BloodVolumeStatistic.RECEIVED_GROUP)
    );

    setTotalBloodDonation(totalBloodVolumePerMonth);
  }, [totalBloodDonationYearFilter]);

  const fetchBloodTypeRatio = useCallback(async () => {
    const data = await getStatisticData(
      StatisticFilterModeEnum.BloodVolumeTypeStatistic,
      getYearFilterParam(bloodTypeRatioYearFilter).DateStart,
      getYearFilterParam(bloodTypeRatioYearFilter).DateEnd,
      false
    );

    const bloodVolumeTypeStatistics = data?.statistics[0]?.bloodVolumeTypeStatistics;

    const typeAVolume = getStatisticResultFromGroup(
      bloodVolumeTypeStatistics,
      StatisticEnum.BloodTypeStatistic.A_GROUP
    );

    const typeBVolume = getStatisticResultFromGroup(
      bloodVolumeTypeStatistics,
      StatisticEnum.BloodTypeStatistic.B_GROUP
    );

    const typeABVolume = getStatisticResultFromGroup(
      bloodVolumeTypeStatistics,
      StatisticEnum.BloodTypeStatistic.AB_GROUP
    );

    const typeOVolume = getStatisticResultFromGroup(
      bloodVolumeTypeStatistics,
      StatisticEnum.BloodTypeStatistic.O_GROUP
    );

    const totalBloodTypeVolume = typeAVolume + typeBVolume + typeABVolume + typeOVolume;

    setBloodTypeRatio(
      bloodVolumeTypeStatistics?.length > 0
        ? [
            {
              type: 'A',
              volume: typeAVolume,
              ratio: bloodVolumeRatioCalculator(typeAVolume, totalBloodTypeVolume),
            },
            {
              type: 'B',
              volume: typeBVolume,
              ratio: bloodVolumeRatioCalculator(typeBVolume, totalBloodTypeVolume),
            },
            {
              type: 'AB',
              volume: typeABVolume,
              ratio: bloodVolumeRatioCalculator(typeABVolume, totalBloodTypeVolume),
            },
            {
              type: 'O',
              volume: typeOVolume,
              ratio: bloodVolumeRatioCalculator(typeOVolume, totalBloodTypeVolume),
            },
          ]
        : []
    );

    setTotalVolume(totalBloodTypeVolume);
  }, [bloodTypeRatioYearFilter]);

  const fetchBloodBagVolume = useCallback(async () => {
    const response = await getStatisticData(
      StatisticFilterModeEnum.BloodBagVolumeStatistic,
      getYearFilterParam(bloodBagYearFilter).DateStart,
      getYearFilterParam(bloodBagYearFilter).DateEnd,
      true
    );
    const totalBloodBagVolumePerMonth = response?.statistics?.map((data) => ({
      volume250: getStatisticResultFromGroup(
        data?.bloodBagVolumeStatistics,
        StatisticEnum.BloodBagVolumeStatistic.GROUP_250
      ),
      volume350: getStatisticResultFromGroup(
        data?.bloodBagVolumeStatistics,
        StatisticEnum.BloodBagVolumeStatistic.GROUP_350
      ),
      volume375: getStatisticResultFromGroup(
        data?.bloodBagVolumeStatistics,
        StatisticEnum.BloodBagVolumeStatistic.GROUP_375
      ),
      volume450: getStatisticResultFromGroup(
        data?.bloodBagVolumeStatistics,
        StatisticEnum.BloodBagVolumeStatistic.GROUP_450
      ),
    }));

    setBloodBags(totalBloodBagVolumePerMonth);
  }, [bloodBagYearFilter]);

  useEffect(() => {
    fetchTotalBloodDonation();
  }, [fetchTotalBloodDonation]);

  useEffect(() => {
    fetchBloodTypeRatio();
  }, [fetchBloodTypeRatio]);

  useEffect(() => {
    fetchBloodBagVolume();
  }, [fetchBloodBagVolume]);

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
                {getLastThreeYear(currentYear).map((year, i) => (
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
                {getLastThreeYear(currentYear).map((year, i) => (
                  <MenuItem key={i} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            {bloodTypeRatio.some((data) => data?.volume > 0) ? (
              <>
                <Doughnut
                  options={bloodTypeRatioDoughnutChartOptions}
                  data={bloodTypeRatioDoughnutChartData}
                  plugins={[textCenter]}
                />
                <ChartDetailLegend sx={{ marginTop: '12px' }} data={bloodTypeRatio} />
              </>
            ) : (
              <StyledGridOverlay>
                <NotFoundIcon />
                <Typography fontSize={14} fontWeight={500} sx={{ mt: 1 }}>
                  Không có dữ liệu trong năm {bloodTypeRatioYearFilter}
                </Typography>
              </StyledGridOverlay>
            )}
          </ChartPaper>
        </Grid>

        {/* Blood Bags Chart */}
        <Grid xs={12} item>
          <ChartPaper sx={{ height: '100%' }}>
            <Stack direction="row" justifyContent="flex-end">
              <Select
                sx={{ width: '100px', backgroundColor: '#FFFF' }}
                value={bloodBagYearFilter}
                label="Year"
                onChange={handelChooseBloodBagYear}
              >
                {getLastThreeYear(currentYear).map((year, i) => (
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
