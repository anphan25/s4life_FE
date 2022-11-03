import { Box, IconButton, Stack, styled } from '@mui/material';
import useResponsive from 'hooks/useResponsive';
import NotificationPopover from './NotificationPopover';
import Searchbar from './Searchbar';
import UserPopover from './UserPopover';
import { HiMenuAlt2 } from 'react-icons/hi';

const NavbarStyle = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(3, 4),
  backgroundColor: 'white',

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    width: '100vw',
  },
}));

const Navbar = ({ onOpen }) => {
  const isDesktop = useResponsive('up', 'lg');

  return (
    <NavbarStyle>
      <Stack direction="row" gap={3}>
        {!isDesktop && (
          <IconButton color={'default'} onClick={onOpen}>
            <HiMenuAlt2 />
          </IconButton>
        )}
        <Searchbar />
      </Stack>

      <Stack direction="row" gap={3}>
        <NotificationPopover />
        <UserPopover />
      </Stack>
    </NavbarStyle>
  );
};

export default Navbar;
