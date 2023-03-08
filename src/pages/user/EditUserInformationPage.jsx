import React, { useState, useEffect, useCallback } from 'react';
import { CustomSnackBar } from 'components';
import { HeaderBreadcumbs } from 'components';
import { getUserInfoById } from 'api';
import { errorHandler, HeaderMainStyle, GenderEnum } from 'utils';
import { useParams } from 'react-router-dom';
import EditUserInformationForm from './components/EditUserInformationForm';
import { formatPhoneNumber } from 'utils';

const EditUserInformationPage = () => {
  const { userInformationId } = useParams();
  const [userInfoData, setUserInfoData] = useState();
  const [alert, setAlert] = useState({
    message: '',
    status: false,
    type: 'success',
  });

  const fetchUserDetail = useCallback(async () => {
    const data = await getUserInfoById(userInformationId);
    setUserInfoData({
      nationalId: data?.nationalId,
      citizenId: data?.citizenId,
      phoneNumber: formatPhoneNumber(data?.phoneNumber),
      fullName: data?.fullName,
      dateOfBirth: data?.dateOfBirth,
      address: data?.address,
      gender: GenderEnum[data?.gender === 'Nữ' ? 'Female' : 'Male'].value + '',
    });
  }, []);

  useEffect(() => {
    try {
      fetchUserDetail();
    } catch (error) {
      setAlert({ message: errorHandler(error), type: 'error', status: true });
    } finally {
    }
  }, [fetchUserDetail]);

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading={'Cập nhật thông tin tình nguyện viên'}
          links={[
            { name: 'Trang chủ', to: '/' },
            { name: 'Danh sách tài khoản', to: '/user/list' },
            { name: `${userInfoData?.fullName}` },
          ]}
        />
      </HeaderMainStyle>
      {userInfoData && <EditUserInformationForm userInfoData={userInfoData} />}

      {alert?.status && <CustomSnackBar message={alert.message} type={alert.type} />}
    </>
  );
};

export default EditUserInformationPage;
