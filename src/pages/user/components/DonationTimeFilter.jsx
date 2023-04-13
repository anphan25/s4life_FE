import React, { useState, useEffect, useRef } from 'react';
import { Box, Stack, Button, Typography, MenuItem, Select, Popover, Checkbox, ListItemText } from '@mui/material';
import { getLastThreeYear } from 'utils';
import { Icon } from 'components';
import moment from 'moment';

const currentYear = Number(moment().get('years'));

const DonationTimeFilter = ({ onFilter, disableOperation }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userYearFilter, setUserYearFilter] = useState(currentYear);
  const [donationTimes, setDonationTimes] = useState([]);
  const checkingTimeoutRef = useRef(null);

  const open = Boolean(anchorEl);
  const id = open ? 'filter-popover' : undefined;

  const DonationTimeOpttions = [
    { label: 'Chưa hiến máu', value: 0 },
    { label: '1 lần', value: 1 },
    { label: '2 lần', value: 2 },
    { label: '3 lần', value: 3 },
    { label: '4 lần', value: 4 },
  ];

  const lastThreeYears = getLastThreeYear(currentYear);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickFilter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChooseYear = (event) => {
    setUserYearFilter(event.target.value);
  };

  const handleCheckBoxChange = (e, value) => {
    const temp = [...donationTimes];
    if (e.target.checked) {
      if (!temp.includes(value)) {
        temp.push(value);
        setDonationTimes(temp);
      }
    } else {
      setDonationTimes(temp.filter((item) => item !== value));
    }
  };

  useEffect(() => {
    if (!onFilter) return;

    if (checkingTimeoutRef?.current) {
      clearTimeout(checkingTimeoutRef?.current);
    }

    checkingTimeoutRef.current = setTimeout(() => {
      onFilter(userYearFilter, donationTimes);
    }, 700);
  }, [userYearFilter, donationTimes]);

  return (
    <Box>
      <Button aria-describedby={id} startIcon={<Icon icon="solid-filter" />} onClick={handleClickFilter}>
        Lọc
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack spacing={2} sx={{ p: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>Số lần hiến trong năm</Typography>

          <Box>
            <Select
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return 'Chọn năm';
                }
                return lastThreeYears.find((year) => year === selected)?.toString();
              }}
              sx={{ minWidth: 200 }}
              name={'year'}
              select={'true'}
              value={userYearFilter}
              onChange={handleChooseYear}
              displayEmpty
            >
              <MenuItem
                disabled
                value=""
                sx={{ backgroundColor: 'white !important', mb: 1, pl: 0, fontSize: 12, fontWeight: 'bold' }}
              >
                Chọn năm
              </MenuItem>
              {lastThreeYears.map((year, i) => (
                <MenuItem
                  sx={{ cursor: 'pointer', mb: 1, px: 3, py: 1.5 }}
                  key={i}
                  value={year}
                  disabled={disableOperation}
                >
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Stack spacing={1}>
            {DonationTimeOpttions.map(({ label, value }) => (
              <MenuItem
                sx={{ cursor: 'pointer', margin: '0 !important', px: 3, py: 1.5 }}
                key={value}
                disabled={!userYearFilter || disableOperation}
              >
                <Checkbox
                  checked={donationTimes?.indexOf(value) > -1}
                  disabled={!userYearFilter || disableOperation}
                  onChange={(e) => {
                    handleCheckBoxChange(e, value);
                  }}
                />
                <ListItemText primary={label} />
              </MenuItem>
            ))}
          </Stack>

          <Button
            startIcon={<Icon icon="trash" />}
            onClick={() => {
              setUserYearFilter(currentYear);
              setDonationTimes([]);
            }}
          >
            Bỏ chọn
          </Button>
        </Stack>
      </Popover>
    </Box>
  );
};

export default React.memo(DonationTimeFilter);
