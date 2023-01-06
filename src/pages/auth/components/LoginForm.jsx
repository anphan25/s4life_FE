import { FormHelperText } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { loginUserPassword } from 'api/AuthApi';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { RHFInput, RHFPasswordInput } from 'components';
import { useDispatch, useSelector } from 'react-redux';
import { loginFail, loginSuccess, clearMessage } from 'app/slices/AuthSlice';
import jwtDecode from 'jwt-decode';
import LoadingButton from '@mui/lab/LoadingButton';
import { errorHandler } from 'utils';
import { useState } from 'react';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string().required('Vui lòng nhập mật khẩu'),
});

const LoginForm = () => {
  const defaultValues = {
    username: '',
    password: '',
  };
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const onSubmit = async (data) => {
    try {
      dispatch(clearMessage());
      setIsBtnLoading(true);
      const res = await loginUserPassword(data);
      const currentUser = jwtDecode(res.accessToken);

      if (currentUser?.role === 'Staff') {
        dispatch(loginFail(errorHandler({ response: { status: 403 } })));

        return;
      }

      dispatch(
        loginSuccess({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          user: currentUser,
        })
      );

      sessionStorage.setItem(
        'authTokens',
        JSON.stringify({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        })
      );
      navigate('/');
    } catch (err) {
      dispatch(loginFail(errorHandler(err)));
    } finally {
      setIsBtnLoading(false);
    }
  };
  const { error } = useSelector((state) => state.auth);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <RHFInput
        name="username"
        label="Tên đăng nhập"
        control={control}
        placeholder="Nhập tên đăng nhập"
        sx={{ marginBottom: '24px' }}
      />
      <RHFPasswordInput
        name="password"
        label="Mật khẩu"
        control={control}
        placeholder="Nhập mật khẩu"
        type="password"
      />
      {error && (
        <FormHelperText error sx={{ mt: 0, mb: 2 }}>
          {error}
        </FormHelperText>
      )}
      <LoadingButton variant="contained" type="submit" loading={isBtnLoading}>
        Đăng nhập
      </LoadingButton>
    </form>
  );
};

export default LoginForm;
