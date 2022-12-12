import { InputAdornment, Input, FormControl } from '@mui/material';
import React, { useState, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';

export const SearchBar = ({ sx, onSubmit, ...others }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleSearchForm = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!onSubmit) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      const formValues = {
        searchTerm: value,
      };
      onSubmit(formValues);
    }, 300);
  };
  return (
    <FormControl sx={sx}>
      <Input
        {...others}
        onChange={handleSearchForm}
        value={searchTerm}
        startAdornment={
          <InputAdornment position="start">
            <FiSearch
              style={{
                fontSize: 24,
                marginLeft: '8px',
              }}
            />
          </InputAdornment>
        }
      />
    </FormControl>
  );
};
