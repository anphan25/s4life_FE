import { Box, styled, Stack, Typography } from '@mui/material';
import { RHFPasswordInput, CustomSnackBar } from 'components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { changePassword } from 'api';
import { PASSWORD_PATTERN, errorHandler } from 'utils';

const ChangePassword = () => {
  const ChangePasswordStackStyle = styled(Stack)(({ theme }) => ({ padding: '20px', gap: '20px' }));
  const TitleStyle = styled(Typography)(({ theme }) => ({
    fontSize: '20px',
    fontWeight: '600',
  }));

  const ChangePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: Yup.string()
      .required('Vui lòng nhập mật khẩu hiện tại.')
      .matches(PASSWORD_PATTERN, {
        message:
          'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
        excludeEmptyString: false,
      })
      .oneOf([Yup.ref('newPassword')], 'Xác nhận mật khẩu không trùng khớp.'),
    confirmPassword: Yup.string()
      .required('Vui lòng nhập mật khẩu hiện tại')
      .matches(PASSWORD_PATTERN, {
        message:
          'Mật khẩu cần phải lớn hơn 7 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt (#$^+=!*()@%&/)',
        excludeEmptyString: false,
      })
      .oneOf([Yup.ref('newPassword')], 'Xác nhận mật khẩu không trùng khớp.'),
  });

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(ChangePasswordSchema),
    mode: 'onChange',
  });
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

  const onSubmit = async (data) => {
    setAlert({});
    setIsButtonLoading(true);

    try {
      data.changeMode = 0;
      await changePassword(data);
      setAlert({
        message: 'Thay đổi mật khẩu thành công.',
        status: true,
        type: 'success',
      });
      reset();
      data.currentPassword = '';
      data.changePassword = '';
      data.confirmPassword = '';
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  return (
    <ChangePasswordStackStyle>
      <TitleStyle>Đổi mật khẩu</TitleStyle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <RHFPasswordInput
          label="Mật khẩu hiện tại"
          name="currentPassword"
          control={control}
          placeholder="Nhập mật khẩu hiện tại"
          isRequiredLabel={true}
        />
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
        <Stack>
          <Box sx={{ marginLeft: 'auto', marginTop: '20px' }}>
            <LoadingButton variant="contained" type="submit" loading={isButtonLoading}>
              Cập nhật
            </LoadingButton>
          </Box>
        </Stack>
      </form>

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </ChangePasswordStackStyle>
  );
};

export default ChangePassword;
