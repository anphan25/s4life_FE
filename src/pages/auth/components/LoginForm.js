import { Box, Button, styled, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { RHFInput } from 'components';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  password: Yup.string().required('Vui lòng nhập mật khẩu'),
});

const ButtonLogin = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  marginTop: '24px',

  ':hover': {
    backgroundColor: theme.palette.primary.main,
    filter: 'brightness(90%)',
  },
}));

const LoginForm = () => {
  const defaultValues = {
    email: '',
    password: '',
  };

  const { control } = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  return (
    <form>
      <RHFInput name="email" label="Email" control={control} placeholder="Nhập email" sx={{ marginBottom: '24px' }} />
      <RHFInput name="password" label="Mật khẩu" control={control} placeholder="Nhập mật khẩu" type="password" />
      <Box sx={{ marginLeft: '10px', float: 'left', width: '100%' }}>
        <Typography sx={{ fontSize: '12px', color: '#FC5A5A' }}>Email hoặc mật khẩu không đúng</Typography>
      </Box>
      <ButtonLogin>Đăng nhập</ButtonLogin>
    </form>
  );
};

export default LoginForm;
