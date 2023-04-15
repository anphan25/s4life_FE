import React from 'react';
import { HeaderBreadcumbs } from 'components';
import { useLocation } from 'react-router-dom';
import { HeaderMainStyle } from 'utils';
import AddMobileEventForm from './AddMobileEventForm';

const AddMobileEventPage = () => {
  const location = useLocation();
  return (
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading={'Tạo sự kiện lưu động'}
          links={[
            { name: 'Trang chủ', to: '/' },
            location?.state
              ? { name: `${location?.state?.intendedEventName}`, to: `/event/${location?.state?.intendedEventId}` }
              : { name: 'Danh sách sự kiện lưu động', to: '/event/mobile-list' },
            { name: 'Tạo sự kiện lưu động' },
          ]}
        />
      </HeaderMainStyle>

      <AddMobileEventForm intendedData={location?.state} />
    </div>
  );
};

export default React.memo(AddMobileEventPage);
