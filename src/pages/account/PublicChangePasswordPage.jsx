import { Logo } from 'components';
import { useState, useEffect } from 'react';
import { Paper, Stack, Box, Typography, styled, Button } from '@mui/material';
import { RHFPasswordInput, Icon } from 'components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { changePassword } from 'api';
import { PASSWORD_PATTERN, errorHandler } from 'utils';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { loginUserPassword } from 'api';
import jwtDecode from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { loginSuccess } from 'app/slices/AuthSlice';

const ChangePasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('Vui lòng nhập mật khẩu mới')
    .matches(PASSWORD_PATTERN, {
      message:
        'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
      excludeEmptyString: false,
    })
    .oneOf([Yup.ref('newPassword')], 'Xác nhận mật khẩu không trùng khớp.'),
  confirmPassword: Yup.string()
    .required('Vui lòng nhập lại mật khẩu')
    .oneOf([Yup.ref('newPassword')], 'Xác nhận mật khẩu không trùng khớp.'),
});

const PublicChangePasswordPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isChangeSuccessfully, setChangeSuccessfully] = useState(false);
  const theme = useTheme();

  let params = new URLSearchParams(window.location.search);

  const username = params?.get('username') || '';
  const encodedPassword = params?.get('encoded_password') || '';

  const passwordWordArray = CryptoJS.enc.Base64.parse(encodedPassword);

  const password = passwordWordArray.toString(CryptoJS.enc.Utf8);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const ChangePasswordStackStyle = styled(Stack)(({ theme }) => ({ padding: '20px', gap: '30px' }));

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(ChangePasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setIsButtonLoading(true);

    try {
      data.currentPassword = password;
      data.changeMode = 0;
      await changePassword(data);
      reset();
      data.changePassword = '';
      data.confirmPassword = '';

      setChangeSuccessfully(true);
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
    }
  };
  const login = async () => {
    try {
      const res = await loginUserPassword({ username, password });

      const currentUser = jwtDecode(res.accessToken);

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
    } catch (error) {
      navigate('/permission-denied');
    }
  };

  useEffect(() => {
    login();
  }, []);

  return (
    <Stack
      alignItems="center"
      height="100vh"
      sx={{ background: 'linear-gradient(#C2373A, #9198e5)', position: 'relative' }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '30%',
          borderRadius: '20px',
          padding: '20px',
          margin: 0,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',

          [theme.breakpoints.down('lg')]: {
            width: '50%',
          },

          [theme.breakpoints.down('md')]: {
            width: '80%',
          },
        }}
      >
        {isChangeSuccessfully ? (
          <Box sx={{ color: 'success.main', textAlign: 'center' }}>
            <Icon icon="solid-check-circle" sx={{ width: '100px', height: '100px', marginBottom: '20px' }} />
            <Typography variant="h4" fontWeight="400">
              Đổi mật khẩu thành công!
            </Typography>
            <Button
              variant="contained"
              sx={{ width: '120px', marginTop: '20px', borderRadius: '50px' }}
              onClick={() => {
                navigate('/login');
              }}
            >
              Đăng nhập
            </Button>
          </Box>
        ) : (
          <Box>
            <Logo sx={{ height: 130, width: 130, margin: '0 auto', marginBottom: '20px' }} />

            <ChangePasswordStackStyle>
              <Typography>
                Đổi mật khẩu cho tài khoản <b>{username}</b>
              </Typography>

              <form onSubmit={handleSubmit(onSubmit)}>
                <RHFPasswordInput
                  label="Mật khẩu mới"
                  name="newPassword"
                  control={control}
                  placeholder="Nhập mật khẩu mới"
                  isRequiredLabel={true}
                />
                <RHFPasswordInput
                  label="Nhập lại mật khẩu"
                  name="confirmPassword"
                  control={control}
                  placeholder="Nhập lại mật khẩu"
                  isRequiredLabel={true}
                />

                <LoadingButton sx={{ width: '100%' }} variant="contained" type="submit" loading={isButtonLoading}>
                  Đổi mật khẩu
                </LoadingButton>
              </form>
            </ChangePasswordStackStyle>
          </Box>
        )}
      </Paper>
    </Stack>
  );
};

export default PublicChangePasswordPage;
