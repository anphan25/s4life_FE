import { ClickAwayListener, IconButton, Input, InputAdornment, Slide } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useResponsive from 'hooks/useResponsive';
import useToggle from 'hooks/useToggle';
import styled from '@emotion/styled';
import { Icon } from 'components';

const SearchbarStyle = styled('div')(({ theme }) => ({
  top: 96,
  left: 0,
  zIndex: 999,
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  boxShadow: '0 8px 12px rgb(17 19 21 / 5%)',
  backgroundColor: 'white',
  padding: theme.spacing(1, 3),
}));

const Searchbar = () => {
  const isMobile = useResponsive('down', 'sm');
  const { toggle, onOpen, onClose } = useToggle();
  const navigate = useNavigate();

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <>
      {isMobile ? (
        <ClickAwayListener onClickAway={onClose}>
          <div>
            <IconButton onClick={onOpen}>
              <Icon icon="search" />
            </IconButton>

            <Slide direction="down" in={toggle} mountOnEnter unmountOnExit>
              <SearchbarStyle>
                <Input
                  disableUnderline
                  placeholder={`Tìm kiếm...`}
                  onKeyDown={handleKeyDown}
                  startAdornment={
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      <Icon icon="search" />
                    </InputAdornment>
                  }
                  sx={{
                    mr: 1,
                    fontWeight: 500,
                    color: 'grey.900',
                    backgroundColor: 'grey.200',
                    width: 360,
                    fontSize: 14,
                  }}
                />
              </SearchbarStyle>
            </Slide>
          </div>
        </ClickAwayListener>
      ) : (
        <Input
          disableUnderline
          placeholder={`Tìm kiếm...`}
          onKeyDown={handleKeyDown}
          startAdornment={
            <InputAdornment position="start" sx={{ ml: 1 }}>
              <Icon icon="search" />
            </InputAdornment>
          }
          sx={{
            mr: 1,
            fontWeight: 500,
            color: 'grey.900',
            width: 360,
            fontSize: 14,
          }}
        />
      )}
    </>
  );
};

export default Searchbar;
