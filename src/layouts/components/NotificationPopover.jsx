import { Badge, Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { BellIcon } from 'assets';
import { Dropdown } from 'components';
import useToggle from 'hooks/useToggle';
import { useState } from 'react';
import { BiCheckDouble } from 'react-icons/bi';

const NotificationPopover = () => {
  const [totalUnRead, setTotalUnRead] = useState(4);
  const { toggle, onToggle } = useToggle();

  const handleMarkAllAsRead = () => {
    setTotalUnRead(0);
  };

  return (
    <>
      <IconButton sx={{ width: '56px' }} color={toggle ? 'primary' : 'default'} onClick={onToggle}>
        <Badge color="error" variant="dot" invisible={totalUnRead === 0}>
          <BellIcon />
        </Badge>
      </IconButton>
      <Dropdown open={Boolean(toggle)} onClose={onToggle} sx={{ width: 360, p: 0, mt: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">
              Thông báo<optgroup></optgroup>
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Bạn có {totalUnRead} thông báo chưa xem
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <BiCheckDouble />
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
