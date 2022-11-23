import { Autocomplete, FormControl, FormLabel, FormHelperText, TextField } from '@mui/material';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

export const RHFAutoComplete = ({ name, label, control, isLazyLoad, onScrollToBottom, ...props }) => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [size, setSize] = useState(10);
  return (
    <Controller
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormLabel htmlFor={name}>{label}</FormLabel>
          <Autocomplete
            id={name}
            {...props}
            {...field}
            ListboxProps={{
              onScroll: (event) => {
                if (isLazyLoad) {
                  const listboxNode = event.currentTarget;

                  if (Math.round(listboxNode.scrollTop) + listboxNode.clientHeight === listboxNode.scrollHeight) {
                    setSize(size + 10);
                    onScrollToBottom(size, '');

                    if (isAtBottom) {
                      listboxNode.scrollTop = listboxNode.scrollHeight - 50 * 20;
                      setIsAtBottom(false);
                    }
                  }
                }
              },
            }}
            onInputChange={(e, value) => {
              onScrollToBottom(size, value);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
          {!!error && (
            <FormHelperText error sx={{ mt: 1 }}>
              {error?.message?.toString()}
            </FormHelperText>
          )}
        </FormControl>
      )}
      onChange={([, data]) => data}
      name={name}
      control={control}
    />
  );
};

{
  /* <Autocomplete
ListboxProps={{
  onScroll: (event) => {
    const listboxNode = event.currentTarget;
    // const visibleHeight = listboxNode.offsetHeight;
    // console.log('visibleHeight: ', visibleHeight);
    console.log('listboxNode.clientHeight: ', listboxNode.clientHeight);
    console.log('listboxNode.scrollTop: ', listboxNode.scrollTop);
    console.log('listboxNode.scrollHeight: ', listboxNode.scrollHeight);

    if (Math.round(listboxNode.scrollTop) + listboxNode.clientHeight === listboxNode.scrollHeight) {
      topFilms.push(
        { title: 'The Dark Knight7' },
        { title: 'The Dark Knight8' },
        { title: 'The Dark Knight9' },
        { title: 'The Dark Knight10' },
        { title: 'The Dark Knight11' },
        { title: 'The Dark Knight12' },
        { title: 'The Dark Knight13' },
        { title: 'The Dark Knight14' },
        { title: 'The Dark Knight15' },
        { title: 'The Dark Knight16' },
        { title: 'The Dark Knight17' },
        { title: 'The Dark Knight18' },
        { title: 'The Dark Knight19' },
        { title: 'The Dark Knight20' },
        { title: 'The Dark Knight21' },
        { title: 'The Dark Knight22' },
        { title: 'The Dark Knight23' },
        { title: 'The Dark Knight24' },
        { title: 'The Dark Knight25' },
        { title: 'The Dark Knight26' },
        { title: 'The Dark Knight27' }
      );

      setData(topFilms);
      setScroll(true);
    }

    if (scroll) {
      listboxNode.scrollTop = listboxNode.scrollHeight - 50 * 20;
      setScroll(false);
    }
  },
}}
options={data}
// value={topFilms}
getOptionLabel={(option) => option.title || ''}
onChange={(e, value) => {}}
renderInput={(params) => <TextField {...params} placeholder="Theater" />}
></Autocomplete> */
}
