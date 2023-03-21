import { useRef } from 'react';
import { SnackbarProvider } from 'notistack';

import { alpha } from '@mui/material/styles';
import { Box, IconButton, styled } from '@mui/material';
import { Icon } from 'components';

const StyledMaterialDesignContent = styled('div')(({ theme }) => ({
  fontWeight: '600 !important',
  '& .notistack-MuiContent': { boxShadow: 'rgba(145, 158, 171, 0.16) 0px 8px 16px 0px', borderRadius: '8px' },

  '& .notistack-MuiContent-success, .notistack-MuiContent-error, .notistack-MuiContent-info, .notistack-MuiContent-warning':
    {
      backgroundColor: theme.palette.grey[0],
      color: theme.palette.grey[900],
    },
}));

export default function NotistackProvider({ children }) {
  const notistackRef = useRef(null);

  const onClose = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <>
      {/* <SnackbarStyles /> */}
      <StyledMaterialDesignContent>
        <SnackbarProvider
          sx={{ fontWeight: '600 !important' }}
          ref={notistackRef}
          dense
          maxSnack={5}
          preventDuplicate
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          iconVariant={{
            info: <SnackbarIcon icon={'solid-info-circle'} color="info" />,
            success: <SnackbarIcon icon={'solid-check-circle'} color="success" />,
            warning: <SnackbarIcon icon={'solid-exclamation-circle'} color="warning" />,
            error: <SnackbarIcon icon={'solid-times-circle'} color="error" />,
          }}
          // With close as default
          action={(key) => (
            <IconButton size="small" onClick={onClose(key)} sx={{ p: 0.5 }}>
              <Icon icon="solid-times" />
            </IconButton>
          )}
        >
          {children}
        </SnackbarProvider>
      </StyledMaterialDesignContent>
    </>
  );
}

// ----------------------------------------------------------------------

function SnackbarIcon({ icon, color }) {
  return (
    <Box
      component="span"
      sx={{
        mr: 1.5,
        width: 42,
        height: 42,
        display: 'flex',
        padding: '10px',
        alignItems: 'center',
        justifyContent: 'center',
        color: `#FFFFFF`,
        borderRadius: '12px',
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.16),
      }}
    >
      <Icon sx={{ color: (theme) => theme.palette[color].main }} icon={icon} width={18} height={18} />
    </Box>
  );
}
