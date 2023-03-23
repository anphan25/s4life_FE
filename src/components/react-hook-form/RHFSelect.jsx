import { FormControl, TextField, FormLabel, MenuItem } from '@mui/material';
import { Controller } from 'react-hook-form';
import { RequireLabel } from 'utils';

export const RHFSelect = ({ name, control, label, children, isRequiredLabel, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 3 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <RequireLabel> *</RequireLabel> : ''}
          </FormLabel>
          <TextField
            {...field}
            {...props}
            id={name}
            name={name}
            select
            SelectProps={{ native: true }}
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
