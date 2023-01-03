import React, { useState } from 'react';
import { Paper, Box, Stack, styled } from '@mui/material';
import { FilterTab } from 'components';
import ChangePassword from './components/ChangePassword';
import { useSelector } from 'react-redux';

const LeftSideStyle = styled(Stack)(({ theme }) => ({
  padding: '10px',
  width: '25%',
  height: '100%',
}));

const RightSideStyle = styled(Box)(({ theme }) => ({
  width: '75%',
}));

const managerTabValues = [{ label: 'Đổi mật khẩu', value: 1 }];

const adminTabValue = [{ label: 'Đổi mật khẩu', value: 1 }];

const AccountPage = () => {
  let user = useSelector((state) => state.auth.auth?.user);
  const [tab, setTab] = useState(1);

  const handleFilterTabChange = (e, value) => {
    setTab(value);
  };

  return (
    <Paper elevation={0}>
      <Stack direction="row">
        <LeftSideStyle>
          <FilterTab
            orientation="vertical"
            tabs={user.role === 'Admin' ? adminTabValue : managerTabValues}
            onChangeTab={handleFilterTabChange}
            defaultValue={tab}
          />
        </LeftSideStyle>

        <RightSideStyle>{tab === 1 ? <ChangePassword /> : ''}</RightSideStyle>
      </Stack>
    </Paper>
  );
};

export default AccountPage;
