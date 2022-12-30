import React, { useState } from 'react';
import { Paper, Box, Stack, styled } from '@mui/material';
import { FilterTab } from 'components';
import ChangePassword from './components/ChangePassword';
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

const managerTabValues = [{ label: 'Đổi mật khẩu', value: 1 }];

const adminTabValue = [{ label: 'Đổi mật khẩu', value: 1 }];

const AccountPage = () => {
  let user = useSelector((state) => state.auth.auth?.user);
  const [tab, setTab] = useState(user.role === 'Admin' || user.role === 'Staff' ? 2 : 1);

  const handleFilterTabChange = (e, value) => {
    setTab(value);
  };

  return (
    <Paper elevation={1}>
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
