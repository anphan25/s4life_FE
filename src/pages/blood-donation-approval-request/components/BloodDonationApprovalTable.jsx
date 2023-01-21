import {
  Box,
  Typography,
  Grid,
  Button,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { errorHandler, formatDate, convertErrorCodeToMessage } from 'utils';
import { RHFInput, RHFRadio } from 'components';
import React from 'react';

// 0: Reject, 1: Approve
const APPROVAL_OPTIONS = [
  { label: 'Chấp nhận', value: 1, id: 1 },
  { label: 'Từ chối', value: 0, id: 0 },
];

const ApprovalSchema = Yup.object().shape({
  note: Yup.string().required('Vui lòng nhập lý do từ chối.'),
});

const BloodDonationApprovalTable = ({ detailData }) => {
  const { handleSubmit: handleApprovalSubmit, control: approvalControl } = useForm({
    resolver: yupResolver(ApprovalSchema),
    defaultValues: { note: '' },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = () => {};

  console.log('detailData', detailData);

  return (
    <Box>
      <form onSubmit={handleApprovalSubmit(onSubmit)}>
        <TableContainer component={Box}>
          <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left">STT</TableCell>
                <TableCell align="right">Số túi máu</TableCell>
                <TableCell align="right">Số đơn vị máu (ml)</TableCell>
                <TableCell align="left">Ngày hiến</TableCell>
                <TableCell align="left">Phê duyệt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detailData?.bloodDonationApprovals?.map((row, i) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {i + 1}
                  </TableCell>
                  <TableCell align="right">{row?.bloodBagCode}</TableCell>
                  <TableCell align="right">{row?.donationVolume}</TableCell>
                  <TableCell align="left">{formatDate(row?.donationDate, 4)}</TableCell>
                  <TableCell align="left">
                    <RHFRadio
                      isRequiredLabel={true}
                      label=""
                      options={APPROVAL_OPTIONS}
                      control={approvalControl}
                      name="approvals"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </form>
    </Box>
  );
};

export default React.memo(BloodDonationApprovalTable);
