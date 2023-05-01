import React, { useState } from 'react';
import { Paper, Box, Stack, styled } from '@mui/material';
import { FilterTab, HeaderBreadcumbs } from 'components';
import ChangePassword from './components/ChangePassword';

const LeftSideStyle = styled(Box)(({ theme }) => ({
  padding: '12px 0',
  width: '25%',
  height: 'auto',
  backgroundColor: '#FFFF !important',
  borderRight: `1px solid ${theme.palette.grey[300]}`,
}));

const RightSideStyle = styled(Box)(({ theme }) => ({
  width: '75%',
  height: '100%',
}));

const AccountPage = () => {
  const [tab, setTab] = useState(1);

  const handleFilterTabChange = (e, value) => {
    setTab(value);
  };

  return (
    <>
      <HeaderBreadcumbs
        heading="Thông tin tài khoản"
        links={[{ name: 'Trang chủ', to: '/' }, { name: 'Thông tin tài khoản' }]}
      />
      <Paper elevation={0} sx={{ mt: 3, borderRadius: '12px', overflow: 'hidden' }}>
        <Stack direction="row" sx={{ height: '100%' }}>
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
    </>
  );
};

export default AccountPage;
