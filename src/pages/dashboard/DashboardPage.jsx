import React, { useState } from 'react';
import { Paper, Grid, Stack, Box, Typography, styled, Select, MenuItem } from '@mui/material';
import YearSelectFilter from './components/YearSelectFilter';
import { MdOutlineEventNote, MdOutlineWaterDrop } from 'react-icons/md';
import { BsPeople } from 'react-icons/bs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatisticTabContent = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  height: '110px',
  width: '100%',
  paddingLeft: '30px',
  justifyContent: 'start',

  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
  },

  '& .statistic_tab_icon': {
    width: '65px',
    height: '65px',

    [theme.breakpoints.between('lg', 1400)]: {
      width: '55px',
      height: '55px',
    },
    borderRadius: '100%',
    padding: '15px',
  },

  '& .first_icon': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.main,
  },

  '& .second_icon': {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.main,
  },

  '& .third_icon': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.main,
  },

  '& .statistic_tab_number': {
    fontWeight: 800,
    fontSize: '40px',

    [theme.breakpoints.down('lg')]: {
      fontSize: '30px',
    },
  },
}));

const StatisticTabContainer = styled(Paper)(({ theme }) => ({
  padding: '20px',
  backgroundColor: theme.palette.background.white,
  boxShadow: '0px 12px 23px rgba(62, 73, 84, 0.04)',
  width: '100%',
  borderRadius: '20px',
}));

const ChartSection = styled(Box)(({ theme }) => ({}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: '20px',
  boxShadow: '0px 12px 23px rgba(62, 73, 84, 0.04)',
  borderRadius: '20px',

  [theme.breakpoints.between('md', 'lg')]: {
    '& .doughnut-chart': { margin: '0 auto !important', height: '450px !important', width: '450px !important' },
  },

  [theme.breakpoints.between('sm', 'md')]: {
    '& .doughnut-chart': { margin: '0 auto !important', height: '400px !important', width: '400px !important' },
  },

  [theme.breakpoints.between('xs', 'sm')]: {
    '& .bar-chart': { height: '300px !important' },
  },
}));

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Người hiến máu theo tuổi',
    },
  },
};

const doughnutChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: true,
      text: 'Nhóm máu',
    },
  },
};

const DashboardPage = () => {
  const theme = useTheme();
  const [barChartYear, setBarChartYear] = useState(2022);
  const [doughnutCharYear, setDoughnutChartYear] = useState(2022);

  const barChartData = {
    labels: ['18 - 23', '24 - 29', '30 - 45', '36 - 41', '42 - 47', '48 - 53', '54 - 60'],
    datasets: [
      {
        label: 'Số lượng',
        data: [161, 26, 331, 25, 34, 180, 222],
        backgroundColor: `${theme.palette.error.main}`,
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Máu A', 'Máu B', 'Máu AB', 'Máu O'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5],
        backgroundColor: [
          `${theme.palette.error.main}`,
          `${theme.palette.info.main}`,
          `${theme.palette.success.main}`,
          `${theme.palette.warning.main}`,
        ],
        borderWidth: 1,
      },
    ],
  };
  return (
    <Box sx={{ width: '100%' }}>
      {/* Total Tab */}

      <Grid container rowSpacing={7} columnSpacing={{ xl: 7, lg: 3 }} sx={{ marginBottom: '50px' }}>
        <Grid lg={4} xs={12} item>
          <StatisticTabContainer elevation={0}>
            <StatisticTabContent direction="row" spacing={3}>
              <MdOutlineEventNote className="statistic_tab_icon first_icon" />
              <Box>
                <Typography className="statistic_tab_number">56</Typography>
                <Typography>Tổng số sự kiện</Typography>
              </Box>
            </StatisticTabContent>
          </StatisticTabContainer>
        </Grid>

        <Grid lg={4} xs={12} item>
          <StatisticTabContainer elevation={0}>
            <StatisticTabContent direction="row" spacing={3}>
              <BsPeople className="statistic_tab_icon second_icon" />
              <Box>
                <Typography className="statistic_tab_number">126k</Typography>
                <Typography>Tổng số người hiến máu</Typography>
              </Box>
            </StatisticTabContent>
          </StatisticTabContainer>
        </Grid>

        <Grid lg={4} xs={12} item>
          <StatisticTabContainer elevation={0}>
            <StatisticTabContent direction="row" spacing={3}>
              <MdOutlineWaterDrop className="statistic_tab_icon third_icon" />
              <Box>
                <Typography className="statistic_tab_number">65</Typography>
                <Typography>Tổng số máu nhận được</Typography>
              </Box>
            </StatisticTabContent>
          </StatisticTabContainer>
        </Grid>
      </Grid>

      {/* Charts */}
      <ChartSection>
        <Grid container spacing={3}>
          <Grid item lg={8} md={12} sm={12} xs={12}>
            <ChartContainer className="bar-chart" elevation={1}>
              <YearSelectFilter year={barChartYear} />
              <Bar options={barChartOptions} data={barChartData} />
            </ChartContainer>
          </Grid>

          <Grid item lg={4} md={12} sm={12} xs={12}>
            <ChartContainer elevation={1}>
              <YearSelectFilter year={doughnutCharYear} sx={{ mb: '30px' }} />
              <Doughnut className="doughnut-chart" options={doughnutChartOptions} data={doughnutChartData} />
            </ChartContainer>
          </Grid>
        </Grid>
      </ChartSection>
    </Box>
  );
};

export default DashboardPage;
