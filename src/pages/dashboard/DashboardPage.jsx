import React, { useState } from 'react';
import { Paper, Grid, Stack, Box, Typography, styled, Select, MenuItem } from '@mui/material';
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
  justifyContent: 'center',

  // '@media(minWidth: 600px)': {
  //   justifyContent: 'center',
  // },

  '& .statistic_tab_icon': {
    width: '70px',
    height: '70px',
    borderRadius: '100%',
    padding: '12px',
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
  backgroundColor: theme.palette.background.white,
  padding: '20px',
  boxShadow: '0px 12px 23px rgba(62, 73, 84, 0.04)',
  borderRadius: '20px',
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
  const [year, setYear] = useState(2022);

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

      <Grid container spacing={7} sx={{ marginBottom: '50px' }} rowSpacing={5}>
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
            <ChartContainer elevation={1}>
              <Stack direction="row" justifyContent="flex-end">
                <Select
                  sx={{ width: '100px', border: `0.5px solid ${theme.palette.grey[800]}` }}
                  value={year}
                  label="Year"
                  // onChange={handelChooseYear}
                  defaultValue={year}
                >
                  <MenuItem value={2022}>2022</MenuItem>
                  <MenuItem value={2021}>2021</MenuItem>
                  <MenuItem value={2020}>2020</MenuItem>
                </Select>
              </Stack>
              <Bar options={barChartOptions} data={barChartData} />
            </ChartContainer>
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
            <ChartContainer elevation={1}>
              <Doughnut options={doughnutChartOptions} data={doughnutChartData} />
            </ChartContainer>
          </Grid>
        </Grid>
      </ChartSection>
    </Box>
  );
};

export default DashboardPage;
