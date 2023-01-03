import { Avatar, Box, Divider, ListItemIcon, ListItemText, MenuItem, Stack, Typography } from '@mui/material';
import { Dropdown, Icon } from 'components';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSuccess } from 'app/slices/AuthSlice';
import useToggle from 'hooks/useToggle';
import { getVietnameseRole } from 'utils/getVietnameseRole';
import { getHospital } from 'app/slices/HospitalSlice';
import useResponsive from 'hooks/useResponsive';

const UserPopover = () => {
  const isDesktop = useResponsive('up', 'lg');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toggle, onToggle } = useToggle();
  const user = useSelector((state) => state.auth.auth?.user);
  const hospital = useSelector((state) => state.hospital?.data);

  const menu = [
    {
      icon: <Icon icon="user" />,
      name: 'Thông tin tài khoản',
      to: '/account',
    },
  ];

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate('/login');
  };

  useEffect(() => {
    if (user != null && user.role === 'Manager') {
      dispatch(getHospital(user?.hospital_id));
    }
  }, [dispatch, user]);

  return (
    <>
      <Box sx={{ cursor: 'pointer' }} onClick={onToggle}>
        {user?.role === 'Manager' ? (
          <Stack gap={'12px'} direction={'row'} alignItems="center">
            <Avatar src={hospital?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'} />
            {isDesktop && (
              <Typography fontSize={14} fontWeight={600} whiteSpace="nowrap">
                {hospital?.name || ''}
              </Typography>
            )}
          </Stack>
        ) : (
          <Avatar src={user?.picture_url || 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'} />
        )}
      </Box>
      <Dropdown anchorEl={toggle} open={Boolean(toggle)} onClose={onToggle} sx={{ width: 280, p: 0, mt: 8 }}>
        <Box sx={{ padding: '16px 33px 0' }}>
          <Typography noWrap fontSize={20} fontWeight={600}>
            {user?.username || ''}
          </Typography>
          <Typography noWrap fontSize={14} fontWeight={500}>
            {getVietnameseRole(user?.role) || ''}
          </Typography>
        </Box>

        <Stack sx={{ p: 2 }} justifyContent="center">
          <Divider
            sx={{
              mx: 2,
              color: 'grey.400',
              margin: '0 0 8px',
            }}
          />
          {menu.map((option) => (
            <MenuItem
              key={option.name}
              to={option.to}
              component={Link}
              onClick={onToggle}
              sx={{ p: 1.5, color: 'grey.700', borderRadius: '12px' }}
            >
              <ListItemIcon sx={{ color: 'grey.700' }}>{option.icon}</ListItemIcon>
              <ListItemText>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{option.name}</Typography>
              </ListItemText>
            </MenuItem>
          ))}

          <Divider
            sx={{
              mx: 2,
              color: 'grey.400',
            }}
          />
          <MenuItem onClick={handleLogout} sx={{ p: 1.5, color: 'error.main', borderRadius: '12px' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <Icon icon="log-out" />
            </ListItemIcon>
            <ListItemText>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Đăng xuất</Typography>
            </ListItemText>
          </MenuItem>
        </Stack>
      </Dropdown>
    </>
  );
};

export default UserPopover;
