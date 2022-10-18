import { Paper, Grid, Stack, Box, Typography, styled, Select, MenuItem, TextField } from '@mui/material';

const SelectFilterChart = styled(Stack)(({ theme }) => ({
  marginBottom: '10px',
  '& .select-chart': {
    width: '100px',
    boxShadow: '0px 2px 10px rgba(124, 141, 181, 0.12)',

    [theme.breakpoints.down('sm')]: {
      width: '70px',
      height: '30px',
      fontSize: '12px',
    },
  },
}));
const YearSelectFilter = ({ year, sx }) => {
  return (
    <SelectFilterChart direction="row" justifyContent="flex-end">
      <Select
        sx={sx}
        className="select-chart"
        value={year}
        label="Year"
        // onChange={handelChooseYear}
        defaultValue={2022}
      >
        <MenuItem value={2022}>2022</MenuItem>
        <MenuItem value={2021}>2021</MenuItem>
        <MenuItem value={2020}>2020</MenuItem>
      </Select>
    </SelectFilterChart>
  );
};

export default YearSelectFilter;
