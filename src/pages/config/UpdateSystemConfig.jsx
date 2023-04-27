import React, { useEffect, useState } from 'react';
import { FilterTab, HeaderBreadcumbs, RHFInput } from 'components';
import { Box, Grid, Paper, Stack } from '@mui/material';
import { LeftSideStyle, RightSideStyle } from './UpdateSystemConfigStyle';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { updateSystemConfig } from 'api';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { convertErrorCodeToMessage } from 'utils';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { getConfig } from 'app/slices/ConfigSlice';
import { openHubConnection, listenOnHub } from 'config';

const ConfigSchema = Yup.object().shape({
  maxDaysEventDuration: Yup.string().required('Vui lòng nhập số ngày tối đa diễn ra sự kiện'),
  maxDaysUntilEventStart: Yup.string().required('Vui lòng nhập số ngày tối đa được phép tạo sự kiện trước'),
  minDaysUntilFixedEventStart: Yup.string().required('Vui lòng nhập số ngày tối thiểu được phép tạo sự kiện trước'),
  minDaysUntilMobileEventStart: Yup.string().required('Vui lòng nhập số ngày tối thiểu được phép tạo sự kiện trước'),
  minDaysUntilMobileEventFromIntendedEventStart: Yup.string().required(
    'Vui lòng nhập số ngày tối thiểu được phép tạo sự kiện trước từ sự kiện dự kiến'
  ),
});

const UpdateSystemConfig = () => {
  const defaultValues = useSelector((state) => state.config.data);
  const dispatch = useDispatch();
  const [connection, setConnection] = useState(null);
  const [tab, setTab] = useState(0);
  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(ConfigSchema),
    defaultValues,
  });
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const store = useStore();

  const handleFilterTabChange = (e, value) => {
    setTab(value);
  };

  const onSubmit = async (data) => {
    setIsButtonLoading(true);
    await updateSystemConfig(data);
    setIsButtonLoading(false);
  };

  useEffect(() => {
    const openConnection = async () => {
      setConnection(await openHubConnection(store));
    };
    openConnection();
  }, []);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  useEffect(() => {
    listenOnHub(connection, (messageCode) => {
      enqueueSnackbar(convertErrorCodeToMessage(messageCode), {
        variant: messageCode != 12100 ? 'error' : 'success',
        persist: false,
      });
      dispatch(getConfig());
    });
    connection?.onclose((e) => {
      setConnection(null);
    });
  }, [connection]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <HeaderBreadcumbs
        heading="Cài đặt hệ thống"
        links={[{ name: 'Trang chủ', to: '/' }, { name: 'Cài đặt hệ thống' }]}
      />
      <Paper elevation={0} sx={{ mt: 3, borderRadius: '12px', overflow: 'hidden' }}>
        <Stack direction="row" sx={{ height: '100%' }}>
          <LeftSideStyle>
            <FilterTab
              orientation="vertical"
              tabs={[
                { label: 'Tất cả sự kiện', value: 0 },
                { label: 'Sự kiện cố định', value: 1 },
                { label: 'Sự kiện lưu động', value: 2 },
              ]}
              onChangeTab={handleFilterTabChange}
              defaultValue={tab}
            />
          </LeftSideStyle>

          <RightSideStyle>
            {tab === 0 && (
              <Grid container spacing={2}>
                <Grid item md={6} sm={12} xs={12}>
                  <RHFInput
                    name="maxDaysUntilEventStart"
                    label="Số ngày tối đa được phép tạo sự kiện trước"
                    control={control}
                    placeholder="Nhập số ngày tối đa được phép tạo sự kiện trước"
                    sx={{ marginBottom: '24px' }}
                  />
                </Grid>
                <Grid item md={6} sm={12} xs={12}>
                  <RHFInput
                    name="maxDaysEventDuration"
                    label="Số ngày tối đa diễn ra sự kiện"
                    control={control}
                    placeholder="Nhập số ngày tối đa diễn ra sự kiện"
                    sx={{ marginBottom: '24px' }}
                  />
                </Grid>
              </Grid>
            )}
            {tab === 1 && (
              <Grid container spacing={2}>
                <Grid item md={6} sm={12} xs={12}>
                  <RHFInput
                    name="minDaysUntilFixedEventStart"
                    label="Số ngày tối thiểu được phép tạo sự kiện trước"
                    control={control}
                    placeholder="Nhập số ngày tối thiểu được phép tạo sự kiện trước"
                    sx={{ marginBottom: '24px' }}
                  />
                </Grid>
              </Grid>
            )}
            {tab === 2 && (
              <Grid container spacing={2}>
                <Grid item md={6} sm={12} xs={12}>
                  <RHFInput
                    name="minDaysUntilMobileEventStart"
                    label="Số ngày tối thiểu được phép tạo sự kiện trước"
                    control={control}
                    placeholder="Nhập số ngày tối thiểu được phép tạo sự kiện trước"
                    sx={{ marginBottom: '24px' }}
                  />
                </Grid>
                <Grid item md={6} sm={12} xs={12}>
                  <RHFInput
                    name="minDaysUntilMobileEventFromIntendedEventStart"
                    label="Số ngày tối đa được phép tạo sự kiện trước từ sự kiện dự kiến"
                    control={control}
                    placeholder="Nhập số ngày tối đa được phép tạo sự kiện trước"
                    sx={{ marginBottom: '24px' }}
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ float: 'right', marginTop: '20px' }}>
              <LoadingButton variant="contained" type="submit" loading={isButtonLoading}>
                Cập nhật
              </LoadingButton>
            </Box>
          </RightSideStyle>
        </Stack>
      </Paper>
    </form>
  );
};

export default UpdateSystemConfig;
