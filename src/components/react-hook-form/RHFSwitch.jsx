import { Controller } from 'react-hook-form';
import { Switch, FormControlLabel } from '@mui/material';

export default function RHFSwitch({ name, control, onSwitch, ...other }) {
  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Switch
              {...field}
              checked={field.value}
              //   onChange={(e) => {
              //     if (!onSwitch) return;

              //     onSwitch(e);
              //   }}
            />
          )}
        />
      }
      {...other}
    />
  );
}
