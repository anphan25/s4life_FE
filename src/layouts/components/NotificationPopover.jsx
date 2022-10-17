import { Badge, Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { BellIcon } from 'assets';
import { Dropdown } from 'components';
import { useState } from 'react';
import { BiCheckDouble } from 'react-icons/bi';

const NotificationPopover = () => {
  const [totalUnRead, setTotalUnRead] = useState(4);
  const [open, setOpen] = useState(null);

  const handleClose = () => {
    setOpen(null);
  };

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleMarkAllAsRead = () => {
    setTotalUnRead(0);
  };

  return (
    <>
      <IconButton color={open ? 'primary' : 'default'} sx={{ width: 48, height: 48 }} onClick={handleOpen}>
        <Badge color="error" variant="dot" invisible={totalUnRead === 0}>
          <BellIcon />
        </Badge>
      </IconButton>
      <Dropdown anchorEl={open} open={Boolean(open)} onClose={handleClose} sx={{ width: 360, p: 0, mt: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <BiCheckDouble size={24} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />
      </Dropdown>
    </>
  );
};

export default NotificationPopover;
