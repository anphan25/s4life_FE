import React from 'react';
import { HeaderBreadcumbs } from 'components';
import { HeaderMainStyle } from 'utils';
import AddIntendedEventForm from './AddIntendedEventForm';

const AddIntendedEventPage = () => {
  return (
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading={'Tạo sự kiện lưu động dự kiến'}
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Danh sách sự kiện lưu động dự kiến', to: '/event/intended-list' },
            { name: 'Tạo sự kiện lưu động dự kiến' },
          ]}
        />
      </HeaderMainStyle>

      <AddIntendedEventForm />
    </div>
  );
};

export default React.memo(AddIntendedEventPage);
