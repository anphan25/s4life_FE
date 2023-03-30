import { Logo, RHFInput, Icon } from 'components';
import { useState } from 'react';
import { Paper, Stack, Box, Typography, styled, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { EMAIL_PATTERN, errorHandler } from 'utils';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import { forgetPassword } from 'api';

const ChangePasswordStackStyle = styled(Stack)(({ theme }) => ({ padding: '20px', gap: '30px' }));

const ForgetPassword = () => {
  const theme = useTheme();
  const [inputEmailSuccessfully, setInputEmailSuccessfully] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [email, setEmail] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const EmailSchema = Yup.object().shape({
    username: Yup.string().required('Vui lòng nhập email').matches(EMAIL_PATTERN, {
      message: 'Email không hợp lệ',
      excludeEmptyString: false,
    }),
  });

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(EmailSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setIsButtonLoading(true);
    setEmail(data.username);
    try {
      await forgetPassword(data.username);
      reset();
      setInputEmailSuccessfully(true);
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
      setEmail('');
    } finally {
      setIsButtonLoading(false);
    }
  };

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
        {inputEmailSuccessfully ? (
          <Box sx={{ color: 'success.main', textAlign: 'center' }}>
            <Icon icon="solid-check-circle" sx={{ width: '100px', height: '100px', marginBottom: '20px' }} />
            <Typography>
              Chúng tôi đã gửi một email vào địa chỉ <b>{email}</b>. Nếu không nhận được vui lòng kiểm tra thư mục thư
              rác hoặc thử lại.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Logo sx={{ height: 130, width: 130, margin: '0 auto', marginBottom: '20px' }} />

            <ChangePasswordStackStyle>
              <Typography>
                Nhập email đã được đăng ký với S4life của bạn để chúng tôi tiến hành đặt lại mật khẩu cho bạn
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <RHFInput
                  label="Email"
                  name="username"
                  control={control}
                  placeholder="Nhập email"
                  isRequiredLabel={true}
                />

                <LoadingButton sx={{ width: '100%' }} variant="contained" type="submit" loading={isButtonLoading}>
                  Đặt lại mật khẩu
                </LoadingButton>
              </form>
            </ChangePasswordStackStyle>
          </Box>
        )}
      </Paper>
    </Stack>
  );
};

export default ForgetPassword;
