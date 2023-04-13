import { RHFInput } from 'components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogButtonGroupStyle, errorHandler } from 'utils';
import * as Yup from 'yup';
import { Box } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useState } from 'react';
import { cancelEvent } from 'api';
import { enqueueSnackbar } from 'notistack';

const CancelEventForm = ({ onFinishSubmit, handleCloseDialog, eventId }) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const NoteSchema = Yup.object().shape({
    reason: Yup.string().required('Vui lòng nhập lý do'),
  });

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(NoteSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = async (data) => {
    setIsButtonLoading(true);

    try {
      await cancelEvent({ id: eventId, reason: data?.reason });
      await onFinishSubmit();
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
      handleCloseDialog();
    }
  };

  return (
    <Box sx={{ '& .MuiInputBase-input': { padding: '0 !important', height: '100px !important' } }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <RHFInput placeholder="Nhập lý do" multiline minRows={1} maxRows={1} control={control} name={'reason'} />

        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <LoadingButton loading={isButtonLoading} type="submit" variant="contained" autoFocus>
            Hủy
          </LoadingButton>
        </DialogButtonGroupStyle>
      </form>
    </Box>
  );
};

export default CancelEventForm;
