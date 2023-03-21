import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  styled,
  FormGroup,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { errorHandler, formatDate, convertErrorCodeToMessage, DialogButtonGroupStyle } from 'utils';
import React, { useEffect, useState, useRef } from 'react';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { Tag, CustomDialog, RHFInput, RHFRadio } from 'components';
import { useNavigate } from 'react-router-dom';
import { updateApproveBloodDonation } from 'api';
import { useSnackbar } from 'notistack';

// 0: Reject, 1: Approve
const APPROVAL_OPTIONS = [
  { label: 'Chấp nhận', value: 1 },
  { label: 'Từ chối', value: 0 },
];

const RequireLabel = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
}));

const ApprovalSchema = Yup.object().shape({
  approvals: Yup.array().of(
    Yup.object().shape({
      status: Yup.number().required('Vui lòng chọn quyết định phê duyệt'),
      note: Yup.string().default(''),
    })
  ),
});

const BloodDonationApprovalTable = ({ detailData }) => {
  const { handleSubmit, control, setValue } = useForm({
    resolver: yupResolver(ApprovalSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      approvals: detailData?.bloodDonationApprovals?.map((item) => ({
        status: 1,
        note: '',
      })),
    },
  });
  const [connection, setConnection] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [disabledInputIndexes, setDisabledInputIndexes] = useState([]);
  const [isConfirmApprovalOpen, setIsConfirmApprovalOpen] = useState(false);
  const store = useStore();
  const navigate = useNavigate();
  const submitBtnRef = useRef();
  const { enqueueSnackbar } = useSnackbar();

  const isProcessing = detailData?.isProcessing;

  const handleConfirmApprovalDialog = async () => {
    setIsConfirmApprovalOpen(!isConfirmApprovalOpen);
  };

  const handleRejectAll = (event) => {
    if (event.target.checked) {
      const newArr = [];
      detailData?.bloodDonationApprovals.forEach((item, i) => {
        setValue(`approvals[${i}].status`, '0');

        newArr.push(i);
        setDisabledInputIndexes(newArr);
      });
    } else {
      detailData?.bloodDonationApprovals.forEach((item, i) => {
        setValue(`approvals[${i}].status`, '1');

        setDisabledInputIndexes([]);
      });
    }
  };

  const confirmApprovalDialogContent = () => {
    return (
      <Box>
        <Typography>Sau khi duyệt sẽ không thể chỉnh sửa, bạn hãy chắc chắn những thông tin trên là đúng.</Typography>

        <DialogButtonGroupStyle sx={{ marginTop: '10px' }}>
          <Stack>
            <Button onClick={handleConfirmApprovalDialog}>Hủy</Button>
          </Stack>
          <LoadingButton
            loading={isButtonLoading}
            variant="contained"
            onClick={() => {
              submitBtnRef.current.click();
            }}
          >
            Duyệt
          </LoadingButton>
        </DialogButtonGroupStyle>
      </Box>
    );
  };

  const onSubmit = async (data) => {
    const bloodDonationApprovalMappingData = data?.approvals?.map((item, i) => ({
      ...item,
      id: detailData?.bloodDonationApprovals[i].id,
      note: item?.note || '',
    }));

    setIsButtonLoading(true);

    try {
      await updateApproveBloodDonation(detailData?.id, bloodDonationApprovalMappingData);

      setTimeout(() => {
        navigate('/blood-donation-approval-request');
      }, [1500]);
    } catch (error) {
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
    } finally {
      setIsButtonLoading(false);
      handleConfirmApprovalDialog();
    }
  };

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    listenOnHub(connection, (messageCode) => {
      enqueueSnackbar(convertErrorCodeToMessage(messageCode), {
        variant: messageCode < 0 ? 'error' : 'success',
        persist: false,
      });
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  return (
    <Box>
      {isProcessing && (
        <FormGroup>
          <FormControlLabel control={<Checkbox onChange={handleRejectAll} />} label="Từ chối tất cả" />
        </FormGroup>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <TableContainer component={Box} sx={{ maxHeight: 460 }}>
          <Table sx={{ minWidth: 300 }}>
            <TableHead>
              <TableRow>
                <TableCell align="right">Số túi máu</TableCell>
                <TableCell align="right" sx={{ width: '100px' }}>
                  Số đơn vị máu (ml)
                </TableCell>
                <TableCell align="left">Ngày hiến</TableCell>
                <TableCell align="left" sx={{ width: '160px' }}>
                  Phê duyệt <RequireLabel>*</RequireLabel>
                </TableCell>
                <TableCell align="left">Ghi chú</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detailData?.bloodDonationApprovals?.map((item, i) => (
                <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell align="right">{item?.bloodBagCode}</TableCell>
                  <TableCell align="right">{item?.donationVolume}</TableCell>
                  <TableCell align="left">{formatDate(item?.donationDate, 2)}</TableCell>
                  {isProcessing ? (
                    <TableCell align="left">
                      <RHFRadio
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
                        label=""
                        options={APPROVAL_OPTIONS.map((option) => option.value)}
                        getOptionLabel={APPROVAL_OPTIONS.map((option) => option.label)}
                        control={control}
                        name={`approvals[${i}].status`}
                        onSelect={(value) => {
                          //Rejecting will enable note textfield
                          if (value * 1 === 0) {
                            //When Approving
                            const newArr = [...disabledInputIndexes];
                            newArr.push(i);
                            setDisabledInputIndexes(newArr);
                          } else {
                            //When Rejecting
                            const newArr = disabledInputIndexes.filter((t) => t !== i);
                            setDisabledInputIndexes(newArr);
                          }
                        }}
                      />
                    </TableCell>
                  ) : (
                    <TableCell align="left">
                      <Tag status={item?.statusId === 0 ? 'error' : 'success'}>
                        {item?.statusId === 0 ? 'Từ chối' : 'Chấp nhận'}
                      </Tag>
                    </TableCell>
                  )}
                  <TableCell align="left">
                    {isProcessing ? (
                      <RHFInput
                        sx={{ padding: '0 !important' }}
                        placeholder="Nhập ghi chú"
                        multiline
                        disabled={disabledInputIndexes?.includes(i) ? false : true}
                        minRows={1}
                        maxRows={1}
                        control={control}
                        name={`approvals[${i}].note`}
                      />
                    ) : (
                      <Typography>{item?.note || '-'}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {isProcessing && (
          <Stack direction="row" mt={2}>
            <Box sx={{ marginLeft: 'auto' }}>
              <Button sx={{ display: 'none' }} type="submit" ref={submitBtnRef}></Button>
              <Button variant="contained" onClick={handleConfirmApprovalDialog}>
                Duyệt
              </Button>
            </Box>
          </Stack>
        )}
      </form>

      {/* Confirm Approval Dialog */}
      <CustomDialog
        isOpen={isConfirmApprovalOpen}
        onClose={handleConfirmApprovalDialog}
        title="Xác nhận duyệt"
        children={confirmApprovalDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />
    </Box>
  );
};

export default BloodDonationApprovalTable;
