import { Input, InputAdornment, useTheme } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiSearchLine } from 'react-icons/ri';

const Searchbar = () => {
  const theme = useTheme();

  const navigate = useNavigate();

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <Input
      disableUnderline
      placeholder={`Tìm kiếm...`}
      onKeyDown={handleKeyDown}
      startAdornment={
        <InputAdornment position="start" sx={{ ml: 1 }}>
          <RiSearchLine fontSize={24} />
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
  );
};

export default Searchbar;
