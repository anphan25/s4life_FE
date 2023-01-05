import { Box, ListItemIcon, ListItemText, MenuItem, styled, Typography } from '@mui/material';
import { Icon } from 'components';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = styled(MenuItem)(({ theme, active }) => ({
  gap: '20px',
  padding: '14px 20px',
  margin: 0,
  color: active === 'true' ? theme.palette.primary.main : theme.palette.grey[900],
  background: active === 'true' ? theme.palette.primary.light : 'white',
  borderRadius: 0,

  ':hover': {
    color: theme.palette.primary.main,
    background: theme.palette.primary.light,
    fontWeight: 600,

    '& .MuiListItemIcon-root': {
      svg: { fill: theme.palette.primary.main },
    },

    '& .MuiBox-root': {
      div: {
        background: theme.palette.primary.main,
      },
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
    height: '24px',
    width: '24px',
    minWidth: '1.5rem',
    svg: {
      height: '100%',
      width: '100%',
      fill: active === 'true' ? theme.palette.primary.main : theme.palette.grey[900],
    },
  },
}));

const Dot = styled(Box)(({ theme, active }) => ({
  height: '24px',
  width: '24px',
  marginLeft: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  div: {
    borderRadius: '50%',
    height: '4px',
    width: '4px',
    backgroundColor: active === 'true' ? theme.palette.primary.main : theme.palette.grey[900],
  },
}));

const SubHeader = ({ item, active, onActive }) => {
  const [showSubHeader, setShowSubHeader] = useState(false);

  return (
    <>
      <SidebarItem
        active={'false'}
        onClick={() => {
          setShowSubHeader(!showSubHeader);
        }}
      >
        <span />
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{item.name}</Typography>
        </ListItemText>
        <ListItemIcon>
          <Icon
            icon="solid-angle-down-small"
            sx={{ transform: showSubHeader ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}
          />
        </ListItemIcon>
      </SidebarItem>
      <Box
        sx={{
          height: showSubHeader ? 'auto' : '0',
          transition: 'height 0.5s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {item?.children?.map((child) => (
          <SidebarItem
            component={Link}
            key={child.name}
            active={active === child.to ? 'true' : 'false'}
            to={child.to}
            onClick={() => onActive(child.to)}
          >
            <Dot active={active === child.to ? 'true' : 'false'}>
              <div></div>
            </Dot>
            <Typography sx={{ fontSize: 14, fontWeight: active === child.to ? 600 : 500 }}>{child.name}</Typography>
          </SidebarItem>
        ))}
      </Box>
    </>
  );
};

export default SubHeader;
