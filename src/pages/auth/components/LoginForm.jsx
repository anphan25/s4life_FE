import { Box, Button, styled, Typography, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { loginUserPassword } from 'api/AuthApi';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { RHFInput } from 'components';
import { useDispatch, useSelector } from 'react-redux';
import { authPending, loginFail, loginSuccess } from 'app/slices/AuthSlice';
import jwtDecode from 'jwt-decode';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string().required('Vui lòng nhập mật khẩu'),
});

const ButtonLogin = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  marginTop: '24px',

  [theme.breakpoints.between('sm', 'md')]: { width: '133px', height: '56px' },

  [theme.breakpoints.between('xs', 'sm')]: { width: '100%', height: '56px' },

  ':hover': {
    backgroundColor: theme.palette.primary.main,
    filter: 'brightness(90%)',
  },
}));

const LoginForm = () => {
  const defaultValues = {
    username: '',
    password: '',
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const onSubmit = async (data) => {
    try {
      const res = await loginUserPassword(data);

      console.log('res: ', res);

      dispatch(
        loginSuccess({
          accessToken: res.result.accessToken,
          refreshToken: res.result.refreshToken,
          user: jwtDecode(res.result.accessToken),
        })
      );

      localStorage.setItem(
        'authTokens',
        JSON.stringify({
          accessToken: res.result.accessToken,
          refreshToken: res.result.refreshToken,
        })
      );
      navigate('/');
    } catch (err) {
      dispatch(loginFail('Tên đăng nhập hoặc mật khẩu không đúng'));
      console.log(err.message);
    }
  };
  const { error, isLoading } = useSelector((state) => state.auth);
  console.log(error);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <RHFInput
        name="username"
        label="Tên đăng nhập"
        control={control}
        placeholder="Nhập tên đăng nhập"
        sx={{ marginBottom: '24px' }}
      />
      <RHFInput name="password" label="Mật khẩu" control={control} placeholder="Nhập mật khẩu" type="password" />
      {/* <Box sx={{  }}>
        <Typography sx={{ fontSize: '12px', color: '#FC5A5A' }}>Tên đăng nhập hoặc mật khẩu không đúng</Typography>
      </Box> */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 1, backgroundColor: 'white', fontSize: '12px', marginLeft: '10px', float: 'left', width: '100%' }}
        >
          {error}
        </Alert>
      )}
      <ButtonLogin type="submit">Đăng nhập</ButtonLogin>
    </form>
  );
};

export default LoginForm;
