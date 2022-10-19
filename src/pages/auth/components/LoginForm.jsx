import { Box, Button, styled, Typography } from '@mui/material';
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
  '@media screen and (max-width: 320px) and (max-height: 878px)': {
    width: '260px',
    height: '56px',

    //do Smth
  },

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
      console.log('hello');
      const res = await loginUserPassword(data);

      console.log('res: ', res);

      dispatch(
        loginSuccess({
          accessToken: res.token.accessToken,
          refreshToken: res.token.refreshToken,
          user: jwtDecode(res.token.accessToken),
        })
      );

      localStorage.setItem(
        'authTokens',
        JSON.stringify({
          accessToken: res.token.accessToken,
          refreshToken: res.token.refreshToken,
        })
      );
      navigate('/');
    } catch (err) {
      dispatch(loginFail('Tên đăng nhập hoặc mật khẩu không đúng'));
    }
  };

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
      {/* <Box sx={{ marginLeft: '10px', float: 'left', width: '100%' }}>
        <Typography sx={{ fontSize: '12px', color: '#FC5A5A' }}>Tên đăng nhập hoặc mật khẩu không đúng</Typography>
      </Box> */}
      <ButtonLogin type="submit">Đăng nhập</ButtonLogin>
    </form>
  );
};

export default LoginForm;
