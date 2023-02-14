import React, { useState, useEffect, useCallback } from 'react';
import { HeaderBreadcumbs, CustomSnackBar } from 'components';
import { useParams } from 'react-router-dom';
import { errorHandler, HeaderMainStyle } from 'utils';
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

      {/* <AddMobileEventForm /> */}

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </div>
  );
};

export default AddMobileEventPage;
