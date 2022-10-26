import { FormControl, TextField, FormLabel } from '@mui/material';
import { ReactNode } from 'react';
import { useController, Control, Controller } from 'react-hook-form';

export const RHFSelect = ({ name, control, label, children, defaultValue, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormLabel htmlFor={name}>{label}</FormLabel>
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
