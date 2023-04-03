import React, { useState, useEffect, useCallback } from 'react';
import DonationTimeAnalytic from './DonationTimeAnalytic';
import { useTheme } from '@mui/material/styles';
import { Card, Stack, Box, Divider, Typography, Select, MenuItem, CircularProgress } from '@mui/material';
import { getYearFilterParam, getLastThreeYear } from 'utils/extensions/year';
import moment from 'moment';
import { DonationTimeEnum, StatisticFilterModeEnum } from 'utils';
import { getStatisticData } from 'api';

const currentYear = Number(moment().get('years'));
const DonationTimeAnalyticContainer = () => {
  const [yearFilter, setYearFilter] = useState(getLastThreeYear(currentYear)[0]);
  const [data, setData] = useState();
  const [total, setTotal] = useState(0);
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handelChooseBloodTypeRatioYear = (e) => {
    setYearFilter(e.target.value);
  };

  const donationTimeRatioCalculator = (partialValue, totalValue) => {
    const result = (100 * partialValue) / totalValue || 0;

    return result;
  };

  const fetchDonationTimeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { donateTime } = await getStatisticData(
        StatisticFilterModeEnum.DonateTimePerYearStatistic,
        getYearFilterParam(yearFilter).DateStart,
        getYearFilterParam(yearFilter).DateEnd,
        false
      );
      setData(donateTime);
      setTotal(donateTime?.oneTime + donateTime?.twoTime + donateTime?.threeTime + donateTime?.fourTime || 0);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [yearFilter]);

  useEffect(() => {
    fetchDonationTimeData();
  }, [fetchDonationTimeData]);
  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ fontSize: '30px' }}>
          Tỉ lệ số lần hiến / năm
        </Typography>

        <Select
          sx={{ width: '100px', mb: 2 }}
          value={yearFilter}
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
      <Card sx={{ mb: 5 }}>
        {isLoading ? (
          <Box sx={{ height: '112px', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <CircularProgress />
            </Box>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2, overflowY: 'scroll' }}
            >
              <DonationTimeAnalytic title="Tổng" total={total} percent={100} color={theme.palette.text.secondary} />
              <DonationTimeAnalytic
                title={DonationTimeEnum.Once.description}
                total={data?.oneTime}
                percent={donationTimeRatioCalculator(data?.oneTime, total)}
                color={theme.palette.success.main}
              />
              <DonationTimeAnalytic
                title={DonationTimeEnum.Twice.description}
                total={data?.twoTime}
                percent={donationTimeRatioCalculator(data?.twoTime, total)}
                color={theme.palette.warning.main}
              />
              <DonationTimeAnalytic
                title={DonationTimeEnum.Third.description}
                total={data?.threeTime}
                percent={donationTimeRatioCalculator(data?.threeTime, total)}
                color={theme.palette.error.main}
              />
              <DonationTimeAnalytic
                title={DonationTimeEnum.Fourth.description}
                total={data?.fourTime}
                percent={donationTimeRatioCalculator(data?.fourTime, total)}
                color={theme.palette.info.main}
              />
            </Stack>
          </Box>
        )}
      </Card>
    </>
  );
};

export default React.memo(DonationTimeAnalyticContainer);
