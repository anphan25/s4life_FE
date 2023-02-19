import React from 'react';
import { HeaderBreadcumbs, CustomSnackBar } from 'components';

import { HeaderMainStyle } from 'utils';
import AddMobileEventForm from '../components/AddMobileEventForm';

const AddMobileEventPage = () => {
  return (
    <div>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading={'Tạo sự kiện lưu động'}
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Danh sách sự kiện lưu động', to: '/event/mobile-list' },
            { name: 'Tạo sự kiện lưu động' },
          ]}
        />
      </HeaderMainStyle>

      <AddMobileEventForm />

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </div>
  );
};

export default React.memo(AddMobileEventPage);
