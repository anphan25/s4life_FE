const { IconButton } = require('@mui/material');
const { useState } = require('react');
const { Dropdown } = require('./Dropdown');
const { Icon } = require('./Icon');

export function MoreMenuButton({ children }) {
  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Icon icon="more-horizontal-circle" />
      </IconButton>

      <Dropdown
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        sx={{
          width: 180,
          '& .MuiMenuItem-root': { m: 0, gap: 2, svg: { fontSize: 20 } },
        }}
      >
        {children}
      </Dropdown>
    </>
  );
}
