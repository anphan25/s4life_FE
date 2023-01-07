import React, { useState, useEffect, useCallback } from 'react';
import { Stack, styled } from '@mui/material';
import { HeaderBreadcumbs, CustomSnackBar } from 'components';
import { getEventDetailByEventId } from 'api';
import AddEditForm from './components/AddEditForm';
import { useParams } from 'react-router-dom';
import { errorHandler } from 'utils';

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

const AddEditFixedEventPage = () => {
  const { eventId } = useParams();
  const [eventEditData, setEventEditData] = useState();
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

  const isEdit = eventId ? true : false;

  const fetchEventDetailData = useCallback(async () => {
    const data = await getEventDetailByEventId(eventId);

    setEventEditData({
      description: data.description,
      name: data.name,
      eventCode: data.eventCode,
      contactInformation: data.contactInformation,
      locations: {
        name: data.eventLocations[0].location.name,
        address: data.eventLocations[0].location.address,
        placeId: '',
        latitude: data.eventLocations[0].location.latitude * 1,
        longitude: data.eventLocations[0].location.longitude * 1,
      },
      bloodTypeNeed: data.bloodTypeNeed,
      startDate: data.startDate,
      endDate: data.endDate,
      workingTimeStart: data.workingTimeStart,
      workingTimeEnd: data.workingTimeEnd,
      maxParticipant: data.maxParticipant,
      imageUrls: data.eventImages[0].imageUrl,
      isEmergency: data.isEmergency,
    });
  }, []);

  useEffect(() => {
    try {
      if (isEdit) {
        fetchEventDetailData();
      }
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
    }
  }, [fetchEventDetailData]);
  return (
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading={isEdit ? 'Sửa sự kiện cố định' : 'Thêm sự kiện cố định'}
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Danh sách sự kiện cố định', to: '/event/fixed-list' },
            { name: `${isEdit ? 'Sửa sự kiện cố định' : 'Thêm sự kiện cố định'} ` },
          ]}
        />
      </HeaderMainStyle>

      {eventEditData && isEdit ? <AddEditForm isEdit={true} eventEditData={eventEditData} /> : <AddEditForm />}

      {alert?.status && <CustomSnackBar message={alert.message} status={alert.status} type={alert.type} />}
    </div>
  );
};

export default React.memo(AddEditFixedEventPage);
