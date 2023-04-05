import { Autocomplete, FormControl, TextField } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

export const AsyncAutocompleteFilter = ({
  isLazyLoad = false,
  onInput,
  onSelect,
  list,
  onScrollToBottom,
  placeholder,
  ...props
}) => {
  const [size, setSize] = useState(10);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!onScrollToBottom || size <= 10) return;
    onScrollToBottom(size);
  }, [size]);

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
        ListboxProps={{
          role: 'list-box',
          onScroll: (event) => {
            if (!isLazyLoad) return;
            if (!onScrollToBottom) return;

            const listboxNode = event.currentTarget;
            if (Math.ceil(listboxNode.scrollTop) + listboxNode.clientHeight >= listboxNode.scrollHeight) {
              const top = listboxNode.scrollTop;
              setSize(size + 10);

              listboxNode.scrollTo({ top });
            }
          },
        }}
        freeSolo
        includeInputInList
        onInputChange={(e, newValue) => {
          if (!onInput) return;

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            onInput(newValue);
          }, 400);
        }}
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
