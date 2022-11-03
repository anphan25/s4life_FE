import { ListItemIcon, ListItemText, MenuItem, styled, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItemStyle = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
  gap: '0.5rem',
  padding: '1rem 1.25rem',
  color: active === 'true' ? theme.palette.primary.main : theme.palette.grey[900],

  ':hover': {
    color: theme.palette.primary.main,
    background: 'white',
    fontWeight: 600,

    '& .MuiListItemIcon-root': {
      svg: { color: theme.palette.primary.main },
    },
  },

  span: {
    position: 'absolute',
    width: '3px',
    height: '2rem',
    left: 0,
    top: 'calc(50% - 32px/2)',
    transform: active === 'true' ? 'scaleY(100%) translateX(0)' : 'scaleY(0) translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    background: theme.palette.primary.main,
    borderBottomRightRadius: '100%',
    borderTopRightRadius: '100%',

    ':hover': {
      transform: 'scaleY(100%) translateX(0)',
    },
  },

  '& .MuiListItemIcon-root': {
    height: '1.5rem',
    width: '1.5rem',
    minWidth: '1.5rem',
    svg: {
      height: '100%',
      width: '100%',
      color: active === 'true' ? theme.palette.primary.main : theme.palette.grey[600],
    },
  },
}));

const SidebarItem = ({ item, active, onActive }) => {
  return (
    <SidebarItemStyle
      component={Link}
      key={item.name}
      active={active === item.to ? 'true' : 'false'}
      to={item.to}
      onClick={() => onActive(item.to)}
    >
      <span></span>
      <ListItemIcon>{item.icon}</ListItemIcon>
      <ListItemText>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {item.name}
        </Typography>
      </ListItemText>
    </SidebarItemStyle>
  );
};

export default SidebarItem;
