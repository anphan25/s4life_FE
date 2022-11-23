import React from 'react';
import { Stack, styled, Button, Box, Autocomplete, TextField, Paper } from '@mui/material';
import { HeaderBreadcumbs } from 'components';

const HeaderMainStyle = styled(Stack)(({ theme }) => ({
  marginBottom: '20px',
  justifyContent: 'space-between',

  flexDirection: 'row',

  [theme.breakpoints.up('sm')]: {
    alignItems: 'center',
  },

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    justifyContent: 'start',
    gap: '20px',
  },
}));

export const AddEditEventPage = () => {
  return (
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Danh sách sự kiện"
          links={[{ name: 'Trang chủ', to: '/' }, { name: 'Danh sách sự kiện' }]}
        />
      </HeaderMainStyle>
    </div>
  );
};
