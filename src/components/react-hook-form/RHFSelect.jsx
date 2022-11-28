import { FormControl, TextField, FormLabel, styled } from '@mui/material';
import { ReactNode } from 'react';
import { useController, Control, Controller } from 'react-hook-form';

const HeaderMainStyle = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
}));

export const RHFSelect = ({ name, control, label, children, defaultValue, isRequiredLabel, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <HeaderMainStyle>*</HeaderMainStyle> : ''}
          </FormLabel>
          <TextField
            {...field}
            {...props}
            id={name}
            defaultValue={defaultValue}
            name={name}
            select
            fullWidth
            error={!!error}
            helperText={error?.message?.toString()}
          >
            {children}
          </TextField>
        </FormControl>
      )}
    />
  );
};
