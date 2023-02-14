import React, { useState, useEffect, useMemo } from 'react';
import { Stack, MenuItem, Paper, Grid, Button, Box, Typography } from '@mui/material';
import {
  RHFInput,
  RHFEditor,
  RHFAutoComplete,
  RHFDatePicker,
  RHFTimePicker,
  RHFUploadImage,
  RHFCheckbox,
  RHFAsyncAutoComplete,
  CustomSnackBar,
} from 'components';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import moment from 'moment';
import { DEFAULT_EVENT_IMAGE_URL } from 'utils';
import { useNavigate, useParams } from 'react-router-dom';

const minDateHandler = () => {
  return moment().add(1, 'days');
};

const AddMobileEventForm = () => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const navigate = useNavigate();

  const defaultValues = {
    name: '',
    eventCode: '',
    description: '',
    beginEvent: moment().add(1, 'days'),
    workingTimeStart: moment(),
    workingTimeEnd: moment().add(1, 'hours'),
    areas: [],
    imageUrls: [DEFAULT_EVENT_IMAGE_URL],
  };

  const AddEventSchema = Yup.object.shape({});

  const {
    handleSubmit,
    control,
    reset,
    resetField,
    formState: { dirtyFields },
    setValue,
  } = useForm({
    resolver: yupResolver(AddEventSchema),
    defaultValues: defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = () => {};

  const handleUploadEventImg = () => {};

  <form onSubmit={handleSubmit(onSubmit)}>
    <Grid container spacing={3}>
      <Grid xs={12} md={6} item>
        <Paper elevation={1} sx={{ borderRadius: '20px', padding: '30px' }}>
          <Stack spacing={2}>
            <RHFInput isRequiredLabel={true} name="name" label="Tên" control={control} placeholder="Nhập tên" />
            <RHFEditor
              isRequiredLabel={true}
              name="description"
              label="Mô tả"
              defaultValue=""
              control={control}
              placeholder="Nhập mô tả"
            />

            <RHFUploadImage
              label="Ảnh sự kiện"
              borderRadius="15px"
              width="100%"
              height="270px"
              name="imageUrls"
              control={control}
              onUpload={handleUploadEventImg}
            />
          </Stack>
        </Paper>
      </Grid>
      <Grid xs={12} md={6} item>
        <Paper elevation={1} sx={{ borderRadius: '20px', padding: '30px' }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: '75%' }}>chọn area</Box>
            </Stack>
            <Stack spacing={2} direction="row">
              <RHFInput
                isRequiredLabel={true}
                name="eventCode"
                label="Mã sự kiện"
                control={control}
                placeholder="Nhập mã sự kiện"
              />
              <RHFInput
                isRequiredLabel={true}
                name="contactInformation"
                label="Số điện thoại liên hệ"
                control={control}
                placeholder="Nhập số điện thoại liên hệ"
              />
            </Stack>

            <Stack spacing={2} direction="row">
              <RHFDatePicker
                disablePast
                isRequiredLabel={true}
                name="startDate"
                control={control}
                label="Ngày bắt đầu"
                placeholder="Nhập ngày bắt đầu"
                minDate={minDateHandler()}
              />
              <RHFDatePicker
                disablePast
                isRequiredLabel={true}
                name="endDate"
                control={control}
                label="Ngày kết thúc"
                placeholder="Nhập ngày kết thúc"
                minDate={minDateHandler()}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <RHFTimePicker
                mask="__:__"
                isRequiredLabel={true}
                name="workingTimeStart"
                control={control}
                label="Giờ bắt đầu"
                placeholder="Nhập giờ bắt đầu"
              />

              <RHFTimePicker
                mask="__:__"
                isRequiredLabel={true}
                name="workingTimeEnd"
                control={control}
                label="Giờ kết thúc"
                placeholder="Nhập giờ kết thúc"
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <RHFInput
                type="number"
                name="maxParticipant"
                control={control}
                label="Số người tham gia tối đa"
                placeholder="Nhập số người tham gia tối đa"
              />
            </Stack>

            <Stack direction="row">
              <Box sx={{ marginLeft: 'auto' }}>
                <Button
                  sx={{ marginRight: '10px' }}
                  onClick={() => {
                    navigate('/event/mobile-list');
                  }}
                >
                  Hủy
                </Button>
                <LoadingButton loading={isButtonLoading} type="submit" variant="contained">
                  Tạo
                </LoadingButton>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  </form>;
};

export default AddMobileEventForm;
