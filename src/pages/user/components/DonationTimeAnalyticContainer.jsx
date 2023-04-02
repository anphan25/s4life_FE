import React, { useState } from 'react';
import DonationTimeAnalytic from './DonationTimeAnalytic';
import { useTheme } from '@mui/material/styles';
import { Card, Stack, Box, Divider, Typography, Select, MenuItem } from '@mui/material';
import { getYearFilterParam, getLastThreeYear } from 'utils/extensions/year';
import moment from 'moment';
import { DonationTimeEnum } from 'utils';

const currentYear = Number(moment().get('years'));
const DonationTimeAnalyticContainer = () => {
  const [yearFilter, setYearFilter] = useState(getLastThreeYear(currentYear)[0]);
  const theme = useTheme();

  const handelChooseBloodTypeRatioYear = (e) => {
    setYearFilter(e.target.value);
  };

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
        <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2 }}
          >
            <DonationTimeAnalytic
              title="Tổng"
              total={520}
              percent={100}
              icon="ic:round-receipt"
              color={theme.palette.text.secondary}
            />
            <DonationTimeAnalytic
              title={DonationTimeEnum.Once.description}
              total={320}
              percent={70}
              icon="eva:checkmark-circle-2-fill"
              color={theme.palette.success.main}
            />
            <DonationTimeAnalytic
              title={DonationTimeEnum.Twice.description}
              total={60}
              percent={15}
              icon="eva:clock-fill"
              color={theme.palette.warning.main}
            />
            <DonationTimeAnalytic
              title={DonationTimeEnum.Third.description}
              total={30}
              percent={10}
              icon="eva:bell-fill"
              color={theme.palette.error.main}
            />
            <DonationTimeAnalytic
              title={DonationTimeEnum.Fourth.description}
              total={8}
              percent={5}
              icon="eva:file-fill"
              color={theme.palette.info.main}
            />
          </Stack>
        </Box>
      </Card>
    </>
  );
};

export default React.memo(DonationTimeAnalyticContainer);
