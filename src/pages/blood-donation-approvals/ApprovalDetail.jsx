import { Stack, styled, Paper, Box, Typography, Grid, Button, DialogActions } from '@mui/material';
import { HeaderBreadcumbs, CustomSnackBar, CustomDialog, Icon, RHFInput } from 'components';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { errorHandler, formatDate, convertErrorCodeToMessage } from 'utils';
import { getBloodDonationApprovalById, approveBloodDonation, rejectBloodDonation } from 'api';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';

const HeaderMainStyle = styled(Stack)(({ theme }) => ({
  marginBottom: '20px',
  justifyContent: 'space-between',

  flexDirection: 'row',

  [theme.breakpoints.up('sm')]: {
    alignItems: 'center',
  },

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    justifyContent: 'start',
    gap: '20px',
  },
}));

const DialogButtonGroup = styled(DialogActions)(({ theme }) => ({
  marginTop: 'auto',
  padding: '10px 0px 10px !important',

  [theme.breakpoints.down('sm')]: {
    margin: '0 auto',
    '& .dialog_button': {
      fontSize: '10px',
    },
  },
}));

const TitleItemStyle = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
}));

const ApprovalDetail = () => {
  const { id } = useParams();
  const [detailData, setDetailData] = useState();
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [connection, setConnection] = useState(null);
  const store = useStore();
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const RejectDonationSchema = Yup.object().shape({
    note: Yup.string().required('Vui lòng nhập lý do từ chối.'),
  });

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(RejectDonationSchema),
    defaultValues: { note: '' },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    setAlert({});
    setIsButtonLoading(true);

    try {
      await rejectBloodDonation(id, data.note);
      setTimeout(() => {
        navigate('/blood-donation-approvals');
      }, [1300]);
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleApproveConfirmDialog = () => {
    setIsApproveConfirmOpen(!isApproveConfirmOpen);
  };

  const handleRejectDialog = () => {
    setIsRejectDialogOpen(!isRejectDialogOpen);
  };

  const confirmApproveDialogContent = () => {
    return (
      <Box>
        <Typography>
          Bạn có chắc chắn muốn <TitleItemStyle>chấp nhận</TitleItemStyle> ?
        </Typography>

        <DialogButtonGroup sx={{ marginTop: '10px' }}>
          <Button
            onClick={() => {
              handleApproveConfirmDialog();
            }}
          >
            Hủy
          </Button>
          <LoadingButton
            loading={isButtonLoading}
            onClick={async () => {
              setIsButtonLoading(true);
              try {
                await approveBloodDonation(id);
                setTimeout(() => {
                  navigate('/blood-donation-approvals');
                }, [1300]);
              } catch (error) {
                setAlert({ message: errorHandler(error), type: 'error', status: true });
              } finally {
                handleApproveConfirmDialog();
                setIsButtonLoading(false);
              }
            }}
            variant="contained"
            autoFocus
          >
            Ok
          </LoadingButton>
        </DialogButtonGroup>
      </Box>
    );
  };

  const rejectDialogContent = () => {
    return (
      <Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <RHFInput
            multiline={true}
            minRows={2}
            maxRows={4}
            sx={{ padding: 0 }}
            label="Lý do từ chối"
            control={control}
            isRequiredLabel={true}
            placeholder="Nhập lý do từ chối"
            name="note"
          />

          <DialogButtonGroup sx={{ marginTop: '10px' }}>
            <Button
              onClick={() => {
                handleRejectDialog();
              }}
            >
              Hủy
            </Button>
            <LoadingButton loading={isButtonLoading} type="submit" variant="contained" autoFocus>
              Từ chối
            </LoadingButton>
          </DialogButtonGroup>
        </form>
      </Box>
    );
  };

  const getDetailData = useCallback(async () => {
    const response = await getBloodDonationApprovalById(id);
    setDetailData(response);
  }, []);

  useEffect(() => {
    getDetailData();
  }, [getDetailData]);

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
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
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Chi tiết yêu cầu"
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Xét duyệt thẻ hiến máu', to: '/blood-donation-approvals' },
            { name: 'Chi tiết yêu cầu' },
          ]}
        />
      </HeaderMainStyle>

      <Paper sx={{ borderRadius: '12px', padding: '30px' }} elevation={1}>
        <Grid container spacing={4}>
          <Grid item sm={12} md={6}>
            <Box>
              <img src={detailData?.imageUrl} alt="ảnh thẻ hiến máu" />
            </Box>
          </Grid>

          <Grid item sm={12} md={6}>
            <Stack spacing={2}>
              <Typography>
                <TitleItemStyle>Họ và tên:</TitleItemStyle> {detailData?.user?.userInformation?.fullName}
              </Typography>
              <Typography>
                <TitleItemStyle>Địa chỉ:</TitleItemStyle> {detailData?.user?.userInformation?.address}
              </Typography>
              <Typography>
                <TitleItemStyle>Ngày tháng năm sinh: </TitleItemStyle>
                {formatDate(detailData?.user?.userInformation?.dateOfBirth, 4)}
              </Typography>
              <Typography>
                <TitleItemStyle>Số đơn vị:</TitleItemStyle> {detailData?.donationVolume}ml
              </Typography>
              <Typography>
                <TitleItemStyle>Số túi máu:</TitleItemStyle> {detailData?.bloodBagCode}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ marginTop: '30px' }}>
              <Button
                startIcon={<Icon icon="solid-times" />}
                onClick={() => {
                  handleRejectDialog();
                }}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                startIcon={<Icon icon="solid-check" />}
                onClick={() => {
                  handleApproveConfirmDialog(true);
                }}
              >
                Chấp nhận
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/*Approve Confirm Dialog */}
      <CustomDialog
        isOpen={isApproveConfirmOpen}
        onClose={handleApproveConfirmDialog}
        title=""
        children={confirmApproveDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '50% !important', maxHeight: '500px' } }}
      />

      {/*Reject Dialog */}
      <CustomDialog
        isOpen={isRejectDialogOpen}
        onClose={handleRejectDialog}
        title="Từ chối yêu cầu"
        children={rejectDialogContent()}
        sx={{ '& .MuiDialog-paper': { width: '70% !important', maxHeight: '500px' } }}
      />

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </Box>
  );
};

export default ApprovalDetail;
