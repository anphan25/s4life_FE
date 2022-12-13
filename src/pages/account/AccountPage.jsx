import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, Stack, styled } from '@mui/material';
import { FilterTab } from 'components';
import HospitalInfo from './components/HospitalInfo';
import ChangePassword from './components/ChangePassword';
import { getHospitalById } from 'api/HospitalApi';
import { useSelector } from 'react-redux';

const LeftSideStyle = styled(Stack)(({ theme }) => ({
  padding: '20px',
  width: '25%',

  '& .tab-name': {
    padding: '8px 15px',
    fontWeight: '600',
    borderRadius: '8px',
    fontSize: '15px',
  },

  '& .MuiTab-root': { textAlign: 'right' },
}));

const RightSideStyle = styled(Box)(({ theme }) => ({
  width: '75%',
}));

const filterManagerStaffTabValues = [
  { label: 'Thông tin bệnh viện', value: 1 },
  { label: 'Đổi mật khẩu', value: 2 },
];

const adminTabValue = [{ label: 'Đổi mật khẩu', value: 2 }];

const AccountPage = () => {
  let user = useSelector((state) => state.auth.auth?.user);
  const [tab, setTab] = useState(user.role === 'Admin' ? 2 : 1);

  const handleFilterTabChange = (e, value) => {
    setTab(value);
  };

  return (
    <Paper elevation={1}>
      <Stack direction="row">
        <LeftSideStyle>
          <FilterTab
            orientation="vertical"
            tabs={user.role === 'Admin' ? adminTabValue : filterManagerStaffTabValues}
            onChangeTab={handleFilterTabChange}
            defaultValue={tab}
          />
        </LeftSideStyle>

        <RightSideStyle>{tab === 1 ? <HospitalInfo /> : <ChangePassword />}</RightSideStyle>
      </Stack>
    </Paper>
  );
};

export default AccountPage;
