import React, { useState } from 'react';
import { Paper, Box, Stack, styled } from '@mui/material';
import { FilterTab } from 'components';
import ChangePassword from './components/ChangePassword';

const LeftSideStyle = styled(Stack)(({ theme }) => ({
  padding: '10px',
  width: '25%',
  height: '100%',
  backgroundColor: '#FFFF !important',
}));

const RightSideStyle = styled(Box)(({ theme }) => ({
  width: '75%',
}));

const AccountPage = () => {
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
            tabs={[{ label: 'Đổi mật khẩu', value: 1 }]}
            onChangeTab={handleFilterTabChange}
            defaultValue={tab}
          />
        </LeftSideStyle>

        <RightSideStyle>{<ChangePassword />}</RightSideStyle>
      </Stack>
    </Paper>
  );
};

export default AccountPage;
