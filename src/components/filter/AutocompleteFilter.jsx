import { Autocomplete, FormControl, TextField } from '@mui/material';

export const AutocompleteFilter = ({ onSelect, list, placeholder, ...props }) => {
  return (
    <FormControl sx={props.sx}>
      <Autocomplete
        {...props}
        sx={{ width: '100%' }}
        onChange={(event, newValue) => {
          if (!onSelect) return;
          onSelect(newValue);
        }}
        options={list}
        freeSolo
        includeInputInList
        filterSelectedOptions
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder || ''}
            inputProps={{
              ...params.inputProps,
              autoComplete: 'off',
            }}
          />
        )}
      />
    </FormControl>
  );
};
