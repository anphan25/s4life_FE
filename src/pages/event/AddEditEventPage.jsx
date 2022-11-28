import React, { useState, useEffect } from 'react';
import { Stack, styled } from '@mui/material';
import { HeaderBreadcumbs, CustomSnackBar } from 'components';
import { getEventDetailByEventId } from 'api';
import AddEditForm from './components/AddEditForm';
import { useParams } from 'react-router-dom';

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

const AddEditEventPage = () => {
  const { eventId } = useParams();
  const [eventEditData, setEventEditData] = useState();

  const isEdit = eventId ? true : false;

  const fetchEventDetailData = async () => {
    const data = await getEventDetailByEventId(eventId);
    // editEventData.description = data.description;
    // editEventData.name = data.name;
    // editEventData.eventCode = data.eventCode;
    // editEventData.contactInformation = data.contactInformation;
    // editEventData.bloodTypeNeed = data.bloodTypeNeed;
    // editEventData.locationIDs = data.eventLocations[0].id;
    // editEventData.startDate = data.startDate;
    // editEventData.endDate = data.endDate;
    // editEventData.workingTimeStart = data.workingTimeStart;
    // editEventData.workingTimeEnd = data.workingTimeEnd;
    // editEventData.maxParticipant = data.maxParticipant;

    setEventEditData({
      description: data.description,
      name: data.name,
      eventCode: data.eventCode,
      contactInformation: data.contactInformation,
      locationIDs: data.eventLocations[0].id,
      bloodTypeNeed: data.bloodTypeNeed,
      startDate: data.startDate,
      endDate: data.endDate,
      workingTimeStart: data.workingTimeStart,
      workingTimeEnd: data.workingTimeEnd,
      maxParticipant: data.maxParticipant,
      imageUrls: data.eventImages[0].imageUrl,
    });
  };

  useEffect(() => {
    try {
      if (isEdit) {
        fetchEventDetailData();
      }
    } catch (err) {}
  }, []);
  return (
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading={isEdit ? 'Sửa sự kiện cố định' : 'Thêm sự kiện cố định'}
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Danh sách sự kiện cố định', to: '/event/list' },
            { name: `${isEdit ? 'Sửa sự kiện cố định' : 'Thêm sự kiện cố định'} ` },
          ]}
        />
      </HeaderMainStyle>

      <AddEditForm isEdit={isEdit} eventEditData={eventEditData} />
    </div>
  );
};

export default AddEditEventPage;
