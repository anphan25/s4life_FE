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
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { errorHandler, formatDate, convertErrorCodeToMessage } from 'utils';
import { RHFInput, RHFRadio } from 'components';
import React, { useEffect, useState, useRef } from 'react';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { CustomSnackBar, Tag } from 'components';
import { useNavigate } from 'react-router-dom';
import { updateApproveBloodDonation } from 'api';

// 0: Reject, 1: Approve
const APPROVAL_OPTIONS = [
  { label: 'Chấp nhận', value: 1, id: 1 },
  { label: 'Từ chối', value: 0, id: 0 },
];

const RequireLabel = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
}));

const ApprovalSchema = Yup.object().shape({
  approvals: Yup.array().of(
    Yup.object().shape({
      status: Yup.string().required('Vui lòng chọn quyết định phê duyệt'),
      note: Yup.string(),
    })
  ),
});

const BloodDonationApprovalTable = ({ detailData }) => {
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(ApprovalSchema),
    // defaultValues: mappingBloodDonationApprovals(detailData),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const [connection, setConnection] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(null);
  const [disabledInputIndexes, setDisabledInputIndexes] = useState([]);
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const store = useStore();
  const navigate = useNavigate();
  const isProcessing = detailData?.isProcessing;

  const onSubmit = async (data) => {
    console.log('datada dd', data);
    const bloodDonationApprovalMappingData = data?.approvals?.map((item, i) => ({
      ...item,
      id: detailData?.bloodDonationApprovals[i].id,
      note: item?.note || '',
    }));

    setAlert({});
    setIsButtonLoading(true);

    try {
      await updateApproveBloodDonation(detailData?.id, bloodDonationApprovalMappingData);

      setTimeout(() => {
        navigate('/blood-donation-approval-request');
      }, [1500]);
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  useEffect(() => {
    // if (!isProcessing) return;
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    // if (!isProcessing) return;
    listenOnHub(connection, (messageCode) => {
      setAlert({
        message: convertErrorCodeToMessage(messageCode),
        type: messageCode < 0 ? 'error' : 'success',
        status: true,
      });
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TableContainer component={Box}>
          <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left">STT</TableCell>
                <TableCell align="right">Số túi máu</TableCell>
                <TableCell align="right">Số đơn vị máu (ml)</TableCell>
                <TableCell align="left">Ngày hiến</TableCell>
                <TableCell align="left">
                  Phê duyệt <RequireLabel>*</RequireLabel>
                </TableCell>
                <TableCell align="left">Ghi chú</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detailData?.bloodDonationApprovals?.map((item, i) => (
                <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {i + 1}
                  </TableCell>
                  <TableCell align="right">{item?.bloodBagCode}</TableCell>
                  <TableCell align="right">{item?.donationVolume}</TableCell>
                  <TableCell align="left">{formatDate(item?.donationDate, 4)}</TableCell>
                  {isProcessing ? (
                    <TableCell align="left">
                      <RHFRadio
                        label=""
                        options={APPROVAL_OPTIONS}
                        control={control}
                        name={`approvals[${i}].status`}
                        onSelect={(value) => {
                          //Rejecting will enable note textfield
                          if (value * 1 === 0) {
                            const newArr = [...disabledInputIndexes];
                            newArr.push(i);
                            setDisabledInputIndexes(newArr);
                          } else {
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
              <Button
                sx={{ marginRight: '10px' }}
                onClick={() => {
                  navigate('/blood-donation-approval-request');
                }}
              >
                Hủy
              </Button>
              <LoadingButton type="submit" loading={isButtonLoading} variant="contained">
                Duyệt
              </LoadingButton>
            </Box>
          </Stack>
        )}
      </form>

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </Box>
  );
};

export default BloodDonationApprovalTable;
