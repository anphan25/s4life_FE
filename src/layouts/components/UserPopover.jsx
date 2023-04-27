import { Avatar, Box, Divider, ListItemIcon, ListItemText, MenuItem, Stack, Typography } from '@mui/material';
import { Dropdown, Icon } from 'components';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { logoutSuccess } from 'app/slices/AuthSlice';
import useToggle from 'hooks/useToggle';
import { RoleEnum } from 'utils';
import { getHospital } from 'app/slices/HospitalSlice';
import useResponsive from 'hooks/useResponsive';
import { getConfig, setConfig } from 'app/slices/ConfigSlice';
import { openHubConnection } from 'config';
import { listenOnHubToGetConfig } from 'config';

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
    if (user != null && (user.role === 'Manager' || user.role === 'Employee')) {
      dispatch(getHospital(user?.hospital_id));
    }
    dispatch(getConfig());
  }, [dispatch, user]);

  return (
    <>
      <Box sx={{ cursor: 'pointer' }} onClick={onToggle}>
        {user?.role === 'Manager' || user?.role === 'Employee' ? (
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
        <Box sx={{ padding: '16px 24px 0' }}>
          <Typography noWrap fontSize={20} fontWeight={600}>
            {user?.username || ''}
          </Typography>
          <Typography noWrap fontSize={14} fontWeight={500}>
            {RoleEnum[user?.role].description || ''}
          </Typography>
        </Box>

        <Stack sx={{ p: 2 }} justifyContent="center">
          <Divider
            sx={{
              color: 'grey.400',
              mb: 1.5,
            }}
          />
          {menu.map((option) => (
            <MenuItem
              key={option.name}
              to={option.to}
              component={Link}
              onClick={onToggle}
              sx={{ color: 'grey.700', m: 0 }}
            >
              <ListItemIcon sx={{ color: 'grey.700' }}>{option.icon}</ListItemIcon>
              <ListItemText>{option.name}</ListItemText>
            </MenuItem>
          ))}
          <Divider
            sx={{
              my: '12px !important',
              color: 'grey.400',
            }}
          />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main', m: 0 }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <Icon icon="log-out" />
            </ListItemIcon>
            <ListItemText>Đăng xuất</ListItemText>
          </MenuItem>
        </Stack>
      </Dropdown>
    </>
  );
};

export default UserPopover;
