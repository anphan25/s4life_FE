import { useState, useEffect, useCallback } from 'react';
import { getHospitalById } from 'api';
import { useParams } from 'react-router-dom';
import { openHubConnection, listenOnHub } from 'config';
import { useStore } from 'react-redux';
import { useSnackbar } from 'notistack';
import { convertErrorCodeToMessage, HeaderMainStyle, restructureHospitalSchedule } from 'utils';
import { HeaderBreadcumbs } from 'components';
import EditHospitalInfoForm from './components/EditHospitalInfoForm';
import { Box, CircularProgress, Paper } from '@mui/material';
import moment from 'moment';

const EditHospitalInfoPage = () => {
  const { hospitalId } = useParams();
  const [hospitalInfo, setHospitalInfo] = useState();
  const [connection, setConnection] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const store = useStore();

  const fetchHospitalInfo = useCallback(async () => {
    const data = await getHospitalById(hospitalId);

    const formatSchedule = restructureHospitalSchedule(data?.nextWeekSchedule)?.map((day) => ({
      ...day,
      startTime: day?.isEnabled
        ? moment(day?.startTime, 'HH:mm:ss').seconds(0).millisecond(0)
        : moment('08:00:00', 'HH:mm:ss').seconds(0).millisecond(0),
      endTime: day?.isEnabled
        ? moment(day?.endTime, 'HH:mm:ss').seconds(0).millisecond(0)
        : moment('17:00:00', 'HH:mm:ss').seconds(0).millisecond(0),
    }));

    setHospitalInfo({
      name: data?.name,
      address: data?.address,
      latitude: data?.latitude,
      longitude: data?.longitude,
      email: data?.email,
      phoneNumber: data?.phoneNumber,
      nextWeekSchedule: formatSchedule,
    });
  }, []);

  useEffect(() => {
    fetchHospitalInfo();
  }, [fetchHospitalInfo]);

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
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Cập nhật thông tin bệnh viện"
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Thông tin bệnh viện', to: `/hospital/${hospitalId}` },
            { name: 'Cập nhật thông tin bệnh viện' },
          ]}
        />
      </HeaderMainStyle>

      {hospitalInfo ? (
        <EditHospitalInfoForm hospitalInfo={hospitalInfo} />
      ) : (
        <Paper sx={{ height: '500px', position: 'relative' }} elevation={2}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </Box>
        </Paper>
      )}
    </>
  );
};

export default EditHospitalInfoPage;
