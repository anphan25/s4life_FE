import { FormHelperText } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { loginUserPassword } from 'api/AuthApi';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { RHFInput } from 'components';
import { useDispatch, useSelector } from 'react-redux';
import { loginFail, loginSuccess } from 'app/slices/AuthSlice';
import jwtDecode from 'jwt-decode';
import LoadingButton from '@mui/lab/LoadingButton';
import { errorHandler } from 'utils';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string().required('Vui lòng nhập mật khẩu'),
});

// const ButtonLogin = styled(LoadingButton)(({ theme }) => ({
//   backgroundColor: theme.palette.primary.main,
//   color: 'white',
//   marginTop: '24px',

//   [theme.breakpoints.between('sm', 'md')]: { width: '133px', height: '56px' },

//   [theme.breakpoints.between('xs', 'sm')]: { width: '100%', height: '56px' },

//   ':hover': {
//     backgroundColor: theme.palette.primary.main,
//     filter: 'brightness(90%)',
//   },
// }));

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

      dispatch(
        loginSuccess({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          user: jwtDecode(res.accessToken),
        })
      );

      localStorage.setItem(
        'authTokens',
        JSON.stringify({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        })
      );
      navigate('/');
    } catch (err) {
      dispatch(loginFail(errorHandler(err)));
    }
  };
  const { error, isLoading } = useSelector((state) => state.auth);

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
      {error && (
        <FormHelperText error sx={{ mt: 0, mb: 2 }}>
          {error}
        </FormHelperText>
      )}
      <LoadingButton variant="contained" type="submit" loading={isLoading}>
        Đăng nhập
      </LoadingButton>
    </form>
  );
};

export default LoginForm;
