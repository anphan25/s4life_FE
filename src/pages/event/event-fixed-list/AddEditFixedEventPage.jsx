import React, { useState, useEffect, useCallback } from 'react';
import { HeaderBreadcumbs, CustomSnackBar } from 'components';
import { getEventDetailByEventId } from 'api';
import AddEditFixedEventForm from '../components/AddEditFixedEventForm';
import { useParams } from 'react-router-dom';
import { errorHandler, HeaderMainStyle } from 'utils';

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
    console.log('data', data);

    setEventEditData({
      description: data?.description,
      name: data?.name,
      eventCode: data?.eventCode,
      contactInformation: data?.contactInformation,
      locations: {
        name: data?.eventLocations[0].location.name,
        address: data?.eventLocations[0].location.address,
        placeId: '',
        latitude: data?.eventLocations[0].location.latitude * 1,
        longitude: data?.eventLocations[0].location.longitude * 1,
      },
      bloodTypeNeed: data?.bloodTypeNeed,
      startDate: data?.startDate,
      endDate: data?.endDate,
      workingTimeStart: data?.workingTimeStart,
      workingTimeEnd: data?.workingTimeEnd,
      maxParticipant: data?.maxParticipant,
      imageUrls: data?.images ? data?.images[0] : null,
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
          heading={isEdit ? 'Sửa sự kiện cố định' : 'Tạo sự kiện cố định'}
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Danh sách sự kiện cố định', to: '/event/fixed-list' },
            { name: `${isEdit ? 'Sửa sự kiện cố định' : 'Tạo sự kiện cố định'} ` },
          ]}
        />
      </HeaderMainStyle>

      {eventEditData && isEdit ? (
        <AddEditFixedEventForm isEdit={true} eventEditData={eventEditData} />
      ) : (
        <AddEditFixedEventForm />
      )}

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </div>
  );
};

export default React.memo(AddEditFixedEventPage);
