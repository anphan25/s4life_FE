import React, { useEffect, useCallback, useState } from 'react';
import { Paper, Grid, Stack, Box, Typography, Divider, CircularProgress } from '@mui/material';
import moment from 'moment';
import { formatNumber } from 'utils/functions/formatNumber';
import { Icon } from 'components';
import NewEventList from './components/NewEventList';
import { getStatisticData, getEvents } from 'api';
import { StatisticEnum, EventFilterEnum, StatisticFilterModeEnum, getStatisticResultFromGroup } from 'utils';
import { PageTitle, StatisticTabContainer } from './DashboardStyle.js';

const getFirstAndLastDateInCurrentQuarter = () => {
  const currentQuarter = moment().quarter();
  return {
    DateStart: moment().quarter(currentQuarter).startOf('quarter'),
    DateEnd: moment().quarter(currentQuarter).endOf('quarter'),
  };
};

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventList, setEventList] = useState([]);

  const eventStatistics = data?.statistics[0]?.eventStatistics;
  const eventRegistrationStatistics = data?.statistics[0]?.eventRegistrationStatistics;
  const bloodVolumeStatistics = data?.statistics[0]?.bloodVolumeStatistics;

  // Events
  const unstartedEvents = getStatisticResultFromGroup(eventStatistics, StatisticEnum.EventStatistic.UNSTARTED_GROUP);
  const startedEvents = getStatisticResultFromGroup(eventStatistics, StatisticEnum.EventStatistic.STARTED_GROUP);
  const finishedEvents = getStatisticResultFromGroup(eventStatistics, StatisticEnum.EventStatistic.FINISHED_GROUP);
  const canceledEvents = getStatisticResultFromGroup(eventStatistics, StatisticEnum.EventStatistic.CANCELED_GROUP);
  const totalEvents = formatNumber(unstartedEvents + startedEvents + finishedEvents + canceledEvents);

  // Event Registration
  const cancelledRegistrations = getStatisticResultFromGroup(
    eventRegistrationStatistics,
    StatisticEnum.EventRegistrationStatistic.CANCELLED_GROUP
  );
  const registeredRegistrations = getStatisticResultFromGroup(
    eventRegistrationStatistics,
    StatisticEnum.EventRegistrationStatistic.REGISTERED_GROUP
  );
  const donatedRegistrations = getStatisticResultFromGroup(
    eventRegistrationStatistics,
    StatisticEnum.EventRegistrationStatistic.DONATED_GROUP
  );
  const conditionInsufficientRegistrations = getStatisticResultFromGroup(
    eventRegistrationStatistics,
    StatisticEnum.EventRegistrationStatistic.CONDITION_INSUFFICIENT_GROUP
  );
  const presentRegistrations = getStatisticResultFromGroup(
    eventRegistrationStatistics,
    StatisticEnum.EventRegistrationStatistic.PRESENT_GROUP
  );
  const discardedRegistrations = getStatisticResultFromGroup(
    eventRegistrationStatistics,
    StatisticEnum.EventRegistrationStatistic.DISCARDED_GROUP
  );
  const missedRegistrations = getStatisticResultFromGroup(
    eventRegistrationStatistics,
    StatisticEnum.EventRegistrationStatistic.MISSED_GROUP
  );

  const totalRegistrations =
    cancelledRegistrations +
      registeredRegistrations +
      donatedRegistrations +
      conditionInsufficientRegistrations +
      presentRegistrations +
      discardedRegistrations +
      missedRegistrations || 0;

  // Blood Volume
  const receivedBlood = getStatisticResultFromGroup(
    bloodVolumeStatistics,
    StatisticEnum.BloodVolumeStatistic.RECEIVED_GROUP
  );
  const expectedBloodReceive = getStatisticResultFromGroup(
    bloodVolumeStatistics,
    StatisticEnum.BloodVolumeStatistic.EXPECTED_RECEIVE_GROUP
  );

  const fetchDashboardData = useCallback(async () => {
    const startDate = getFirstAndLastDateInCurrentQuarter().DateStart.format('yyyy-MM-DD');
    const endDate = getFirstAndLastDateInCurrentQuarter().DateEnd.format('yyyy-MM-DD');
    const response = await getStatisticData(StatisticFilterModeEnum.All, startDate, endDate, false);

    setData(response);
  }, []);

  const fetchMostRecentEvents = useCallback(async () => {
    setLoading(true);
    setEventList(await getEvents({ FilterMode: EventFilterEnum.MostRecent }));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchMostRecentEvents();
  }, [fetchDashboardData]);

  return (
    <Box sx={{ width: '100%' }}>
      <PageTitle sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Trang chủ
        </Typography>
        <Paper elevation={0} sx={{ padding: '.65rem 1.25rem', borderRadius: '.475rem' }}>
          <Typography sx={{ textTransform: 'capitalize', fontSize: 12, fontWeight: 600 }}>
            {getFirstAndLastDateInCurrentQuarter().DateStart.format('MMMM, YYYY')} -{' '}
            {getFirstAndLastDateInCurrentQuarter().DateEnd.format('MMMM, YYYY')}
          </Typography>
        </Paper>
      </PageTitle>

      {/* Total Tab */}
      <Grid container rowSpacing={4} columnSpacing={{ xl: 5, lg: 3 }} sx={{ marginBottom: '50px' }}>
        <Grid lg={4} xs={12} item>
          <StatisticTabContainer elevation={0}>
            {data ? (
              <>
                <Stack className="tab_title" direction="row" alignItems="center">
                  <Icon icon="solid-calendar-star" className="tab_title--icon" />
                  <Typography className="tab_title--text">Tổng số sự kiện</Typography>
                </Stack>

                <Stack className="tab_content">
                  <Typography textAlign="center" className="tab_content--number">
                    {formatNumber(unstartedEvents + startedEvents + finishedEvents + canceledEvents || 0)}
                  </Typography>

                  <Stack className="tab_content--status" direction="row" spacing={3} justifyContent="center">
                    <Box className="status_box">
                      <Stack className="status_title" direction="row" alignItems="center" justifyContent="center">
                        <Icon icon="solid-check" className="status_icon success" />
                        <Typography className="status_text">Đã hoàn thành</Typography>
                      </Stack>
                      <Typography className="status_number">
                        {formatNumber(finishedEvents)}/{totalEvents}
                      </Typography>
                    </Box>

                    <Box>
                      <Divider orientation="vertical" />
                    </Box>

                    <Box className="status_box">
                      <Stack className="status_title" direction="row" alignItems="center" justifyContent="center">
                        <Icon icon="solid-times" className="status_icon fail" />
                        <Typography className="status_text">Chưa hoàn thành</Typography>
                      </Stack>
                      <Typography className="status_number">
                        {formatNumber(unstartedEvents + startedEvents)}/{totalEvents}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </>
            ) : (
              <Box textAlign="center">
                <CircularProgress />
              </Box>
            )}
          </StatisticTabContainer>
        </Grid>

        <Grid lg={4} xs={12} item>
          <StatisticTabContainer elevation={0}>
            {data ? (
              <>
                <Stack className="tab_title" direction="row" alignItems="center">
                  <Icon icon="solid-users-group" className="tab_title--icon" />
                  <Typography className="tab_title--text">Tổng số lượt đăng ký sự kiện</Typography>
                </Stack>

                <Stack className="tab_content">
                  <Typography textAlign="center" className="tab_content--number">
                    {formatNumber(totalRegistrations)}
                  </Typography>

                  <Stack className="tab_content--status" direction="row" spacing={3} justifyContent="center">
                    <Box className="status_box">
                      <Stack className="status_title" direction="row" alignItems="center" justifyContent="center">
                        <Icon icon="solid-check" className="status_icon success" />
                        <Typography className="status_text">Đã hiến máu</Typography>
                      </Stack>
                      <Typography className="status_number">
                        {formatNumber(donatedRegistrations)}/{formatNumber(totalRegistrations)}
                      </Typography>
                    </Box>

                    <Box>
                      <Divider orientation="vertical" />
                    </Box>

                    <Box className="status_box">
                      <Stack className="status_title" direction="row" alignItems="center">
                        <Icon icon="solid-times" className="status_icon fail" />
                        <Typography className="status_text">Chưa hiến máu</Typography>
                      </Stack>
                      <Typography className="status_number">
                        {formatNumber(registeredRegistrations)}/{formatNumber(totalRegistrations)}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </>
            ) : (
              <Box textAlign="center">
                <CircularProgress />
              </Box>
            )}
          </StatisticTabContainer>
        </Grid>

        <Grid lg={4} xs={12} item>
          <StatisticTabContainer elevation={0}>
            {data ? (
              <>
                <Stack className="tab_title" direction="row" alignItems="center">
                  <Icon icon="solid-droplet" className="tab_title--icon" />
                  <Typography className="tab_title--text">Tổng số (ml) máu nhận được</Typography>
                </Stack>
                <Stack className="tab_content">
                  <Typography textAlign="center" className="tab_content--number">
                    {formatNumber(receivedBlood)}
                  </Typography>

                  <Stack className="tab_content--status" direction="row" spacing={3} justifyContent="center">
                    <Box className="status_box">
                      <Stack className="status_title" direction="row" alignItems="center">
                        <Icon icon="solid-line-chart-dots" className="status_icon fail" />
                        <Typography className="status_text">Dự kiến nhận</Typography>
                      </Stack>
                      <Typography className="status_number">{formatNumber(expectedBloodReceive)}</Typography>
                    </Box>
                  </Stack>
                </Stack>{' '}
              </>
            ) : (
              <Box textAlign="center">
                <CircularProgress />
              </Box>
            )}
          </StatisticTabContainer>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {loading ? (
            <StatisticTabContainer>
              <Box textAlign="center" height="200px">
                <CircularProgress sx={{ marginTop: '80px' }} />
              </Box>
            </StatisticTabContainer>
          ) : (
            <NewEventList events={eventList} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
