import React, { useState, useEffect, useCallback } from 'react';
import { HeaderBreadcumbs } from 'components';
import { getUserInfoById } from 'api';
import { errorHandler, HeaderMainStyle, GenderEnum } from 'utils';
import { useParams } from 'react-router-dom';
import EditUserInformationForm from './components/EditUserInformationForm';
import { formatPhoneNumber } from 'utils';
import { useSnackbar } from 'notistack';

const EditUserInformationPage = () => {
  const { userInformationId } = useParams();
  const [userInfoData, setUserInfoData] = useState();
  const { enqueueSnackbar } = useSnackbar();

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
      enqueueSnackbar(errorHandler(error), {
        variant: 'error',
        persist: false,
      });
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
    </>
  );
};

export default EditUserInformationPage;
