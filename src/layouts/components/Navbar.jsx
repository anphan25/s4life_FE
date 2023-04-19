import { Box, IconButton, Stack, styled } from '@mui/material';
import useResponsive from 'hooks/useResponsive';
import NotificationPopover from './NotificationPopover';
import Searchbar from './Searchbar';
import UserPopover from './UserPopover';
import { Icon } from 'components';

const NavbarStyle = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '80px',
  backgroundColor: 'white',
  padding: theme.spacing(3),

  [theme.breakpoints.down('sm')]: {
    width: '100vw',
  },
}));

const Navbar = ({ onOpen }) => {
  const isDesktop = useResponsive('up', 'lg');

  return (
    <NavbarStyle>
      <Stack direction="row" gap={3}>
        {!isDesktop && (
          <IconButton sx={{ width: '48px' }} color={'default'} onClick={onOpen}>
            <Icon icon="solid-menu-left-alt" />
          </IconButton>
        )}
      </Stack>

      <Stack direction="row" gap={3}>
        <UserPopover />
      </Stack>
    </NavbarStyle>
  );
};

export default Navbar;
