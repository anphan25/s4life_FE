import { Autocomplete, FormControl, TextField } from '@mui/material';
import { useState } from 'react';

export const LazyLoadAutocomplete = ({ onChange, placeholder, options, loadMore, onInput, ...props }) => {
  const [size, setSize] = useState(10);
  return (
    <FormControl>
      <Autocomplete
        renderInput={(params) => (
          <TextField
            onChange={onChange}
            options={options}
            ListboxProps={{
              onScroll: async (event) => {
                const listboxNode = event.currentTarget;
                if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) {
                  const top = listboxNode.scrollTop;
                  setSize(size + 10);
                  await loadMore(size);
                  listboxNode.scrollTo({ top });
                }
              },
            }}
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
