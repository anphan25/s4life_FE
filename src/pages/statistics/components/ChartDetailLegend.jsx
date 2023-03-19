import { Typography, Stack, Box, styled } from '@mui/material';
import React from 'react';
import { useTheme } from '@mui/material/styles';

const DetailLegendLabel = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
}));

const BloodColorBox = styled(Box)(({ theme }) => ({
  borderRadius: '4px',
  width: '16px',
  height: '16px',
  marginRight: '7px',
}));

const BloodVolumeTypo = styled(Typography)(({ theme }) => ({
  fontSize: '15px',
  color: theme.palette.error.main,
  fontWeight: 'bold',
}));

const BloodRatioTypo = styled(Typography)(({ theme }) => ({
  fontWeight: 300,
  color: theme.palette.grey[600],
}));

const ChartDetailLegend = ({ sx, data }) => {
  const theme = useTheme();

  const typeA = data?.find((data) => data.type === 'A');
  const typeB = data?.find((data) => data.type === 'B');
  const typeAB = data?.find((data) => data.type === 'AB');
  const typeO = data?.find((data) => data.type === 'O');

  return (
    <Stack sx={{ padding: '10px', flexDirection: 'row', justifyContent: 'space-around', ...sx }}>
      <Stack spacing={0.8}>
        <DetailLegendLabel>
          <BloodColorBox sx={{ backgroundColor: theme.palette.error.main }} />
          <Box>A</Box>
        </DetailLegendLabel>

        <BloodVolumeTypo>{typeA?.volume}ml</BloodVolumeTypo>
        <BloodRatioTypo>{typeA?.ratio?.toFixed(2)}%</BloodRatioTypo>
      </Stack>

      <Stack spacing={0.8}>
        <DetailLegendLabel>
          <BloodColorBox sx={{ backgroundColor: theme.palette.success.main }} />
          <Box>B</Box>
        </DetailLegendLabel>

        <BloodVolumeTypo>{typeB?.volume}ml</BloodVolumeTypo>
        <BloodRatioTypo>{typeB?.ratio?.toFixed(2)}%</BloodRatioTypo>
      </Stack>

      <Stack spacing={0.8}>
        <DetailLegendLabel>
          <BloodColorBox sx={{ backgroundColor: theme.palette.info.main }} />
          <Box>AB</Box>
        </DetailLegendLabel>

        <BloodVolumeTypo>{typeAB?.volume}ml</BloodVolumeTypo>
        <BloodRatioTypo>{typeAB?.ratio?.toFixed(2)}%</BloodRatioTypo>
      </Stack>

      <Stack spacing={0.8}>
        <DetailLegendLabel>
          <BloodColorBox sx={{ backgroundColor: theme.palette.warning.main }} />
          <Box>O</Box>
        </DetailLegendLabel>

        <BloodVolumeTypo>{typeO?.volume}ml</BloodVolumeTypo>
        <BloodRatioTypo>{typeO?.ratio?.toFixed(2)}%</BloodRatioTypo>
      </Stack>
    </Stack>
  );
};

export default React.memo(ChartDetailLegend);
