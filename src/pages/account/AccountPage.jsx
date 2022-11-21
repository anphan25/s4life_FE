import { Paper, styled, Stack, Tabs, Tab, Box, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RHFInput } from 'components';
import * as Yup from 'yup';

const ChangePasswordStackStyle = styled(Stack)(({ theme }) => ({ padding: '20px', gap: '20px' }));
const TitleStyle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: '600',
  //   marginBottom: '',
}));

const onSubmit = async () => {};

const AccountInfo = () => {
  const { handleSubmit, control, reset } = useForm({
    // resolver: yupResolver(RegisterSchema),
  });

  return (
    <ChangePasswordStackStyle>
      <TitleStyle>Đổi mật khẩu</TitleStyle>

      <form onSubmit={handleSubmit(onSubmit)}></form>
    </ChangePasswordStackStyle>
  );
};

export default AccountInfo;
