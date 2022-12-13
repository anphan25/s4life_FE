import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { Dropdown } from 'components';
import React from 'react';
import { BiUser } from 'react-icons/bi';
import { TbLogout } from 'react-icons/tb';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSuccess } from 'app/slices/AuthSlice';
import useToggle from 'hooks/useToggle';
import { getVietnameseRole } from 'utils/getVietnameseRole';
import { RiAccountCircleLine } from 'react-icons/ri';

const UserPopover = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toggle, onToggle } = useToggle();
  let user = useSelector((state) => state.auth.auth?.user);

  const menu = [
    {
      icon: <RiAccountCircleLine />,
      name: 'Thông tin tài khoản',
      to: '/account',
    },
  ];

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate('/auth/login');
  };

  return (
    <>
      <IconButton onClick={onToggle}>
        <Avatar src={user?.picture_url || 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'} />
      </IconButton>
      <Dropdown anchorEl={toggle} open={Boolean(toggle)} onClose={onToggle} sx={{ width: 280, p: 0, mt: 8 }}>
        <Box sx={{ padding: '16px 33px 0' }}>
          <Typography noWrap fontSize={20} fontWeight={600}>
            {user?.username || ''}
          </Typography>
          <Typography noWrap fontSize={12} fontWeight={500}>
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
              <ListItemIcon sx={{ fontSize: 24, color: 'grey.600' }}>{option.icon}</ListItemIcon>
              <ListItemText>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{option.name}</Typography>
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
            <ListItemIcon sx={{ fontSize: 24, color: 'error.main' }}>
              <TbLogout />
            </ListItemIcon>
            <ListItemText>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Đăng xuất</Typography>
            </ListItemText>
          </MenuItem>
        </Stack>
      </Dropdown>
    </>
  );
};

export default UserPopover;
