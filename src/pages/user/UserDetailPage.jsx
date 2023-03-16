import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HeaderMainStyle } from 'utils';
import { Box, Divider } from '@mui/material';
import BloodDonationHistory from './components/BloodDonationHistory';
import { HeaderBreadcumbs } from 'components';
import UserInformation from './components/UserInformation';
import { useParams } from 'react-router-dom';
import { getUserInfoById } from 'api';

const UserDetailPage = () => {
  const [userInfoData, setUserInfoData] = useState(null);
  const { userInformationId } = useParams();

  const childRef = useRef();

  const fetchUserInfo = useCallback(async () => {
    setUserInfoData(await getUserInfoById(userInformationId));
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return (
    <Box>
      <HeaderMainStyle>
        <HeaderBreadcumbs
          heading="Thông tin tình nguyện viên"
          links={[{ name: 'Danh sách tài khoản', to: '/user/list' }, { name: `${userInfoData?.fullName}` }]}
        />
      </HeaderMainStyle>

      <UserInformation userInfoData={userInfoData} />

      <Divider sx={{ margin: ' 40px 0 30px' }} />

      <BloodDonationHistory ref={childRef} userInformationId={userInformationId} fetchUserInfo={fetchUserInfo} />
    </Box>
  );
};

export default UserDetailPage;
