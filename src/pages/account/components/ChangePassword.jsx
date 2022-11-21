import { Paper, styled, Stack, Typography } from '@mui/material';
import { RHFInput } from 'components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

const ChangePassword = () => {
  const ChangePasswordStackStyle = styled(Stack)(({ theme }) => ({ padding: '20px', gap: '20px' }));
  const TitleStyle = styled(Typography)(({ theme }) => ({
    fontSize: '20px',
    fontWeight: '600',
    //   marginBottom: '',
  }));

  const { handleSubmit, control, reset } = useForm({
    // resolver: yupResolver(RegisterSchema),
  });

  const onSubmit = async () => {};

  return (
    <ChangePasswordStackStyle>
      <TitleStyle>Đổi mật khẩu</TitleStyle>

      <form onSubmit={handleSubmit(onSubmit)}></form>
    </ChangePasswordStackStyle>
  );
};

export default ChangePassword;
